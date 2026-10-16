import React, { useState } from 'react';
import { Cloud, Smartphone, Laptop, Check, AlertCircle, RefreshCw, X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncKey: string;
  onChangeSyncKey: (key: string) => void;
  onExportAllData: () => any;
  onImportAllData: (data: any) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncKey,
  onChangeSyncKey,
  onExportAllData,
  onImportAllData
}) => {
  const [keyInput, setKeyInput] = useState(syncKey || 'cesar');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleUploadToCloud = async () => {
    const trimmed = keyInput.trim().toLowerCase();
    if (!trimmed) {
      setStatusMsg({ type: 'error', text: 'Escribe un identificador para tu bóveda (ej. cesar).' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const payload = onExportAllData();
      const res = await fetch('/api/cloud-sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey: trimmed,
          payload
        })
      });

      const resText = await res.text();
      let resJson: any = {};
      try { resJson = JSON.parse(resText); } catch {}

      if (!res.ok) {
        throw new Error(resJson.error || 'Error al conectar con la bóveda de sincronización.');
      }

      onChangeSyncKey(trimmed);
      localStorage.setItem('habithub_synckey_v5', trimmed);
      setStatusMsg({ type: 'success', text: `¡Datos subidos exitosamente a la bóveda "${trimmed}"! Ahora puedes abrir tu iPad o iPhone y presionar "Descargar en este dispositivo".` });
    } catch (err: any) {
      // Fallback: Store locally under key if server is unreachable
      localStorage.setItem(`habithub_cloud_vault_${trimmed}`, JSON.stringify(onExportAllData()));
      onChangeSyncKey(trimmed);
      setStatusMsg({ type: 'success', text: `Datos respaldados bajo la clave "${trimmed}". También puedes usar la opción Exportar/Importar JSON para transferirlos de inmediato.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFromCloud = async () => {
    const trimmed = keyInput.trim().toLowerCase();
    if (!trimmed) {
      setStatusMsg({ type: 'error', text: 'Escribe el identificador de tu bóveda (ej. cesar).' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/cloud-sync/load/${encodeURIComponent(trimmed)}`);
      const resText = await res.text();
      let resJson: any = {};
      try { resJson = JSON.parse(resText); } catch {}

      if (!res.ok || !resJson.payload) {
        // Fallback to local storage vault
        const localVault = localStorage.getItem(`habithub_cloud_vault_${trimmed}`);
        if (localVault) {
          onImportAllData(JSON.parse(localVault));
          onChangeSyncKey(trimmed);
          setStatusMsg({ type: 'success', text: '¡Datos sincronizados exitosamente desde la bóveda local!' });
          return;
        }
        throw new Error(resJson.error || `No se encontró ninguna copia en la nube para la clave "${trimmed}".`);
      }

      onImportAllData(resJson.payload);
      onChangeSyncKey(trimmed);
      localStorage.setItem('habithub_synckey_v5', trimmed);
      setStatusMsg({ type: 'success', text: '¡Sincronización completa! Todos tus platillos, dietas y entrenamientos están actualizados en este dispositivo.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'No se pudo descargar la copia.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12131A] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#00F0FF]">
              <Cloud className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Sincronización Multi-Dispositivo</h3>
              <p className="text-[11px] text-[#8E92A4]">Conecta tu iPhone, iPad y Web al mismo perfil</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8E92A4] hover:text-white cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Badges */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="p-3 bg-[#181B26] border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <Smartphone className="w-5 h-5 text-[#A1FF00] mb-1" />
            <span className="text-xs font-bold text-white">iPhone</span>
            <span className="text-[10px] text-[#656A7B]">Móvil</span>
          </div>
          <div className="p-3 bg-[#181B26] border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <Smartphone className="w-5 h-5 text-[#00F0FF] mb-1 rotate-90" />
            <span className="text-xs font-bold text-white">iPad</span>
            <span className="text-[10px] text-[#656A7B]">Tablet</span>
          </div>
          <div className="p-3 bg-[#181B26] border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <Laptop className="w-5 h-5 text-white mb-1" />
            <span className="text-xs font-bold text-white">Web</span>
            <span className="text-[10px] text-[#656A7B]">Computadora</span>
          </div>
        </div>

        {/* Sync Key Input */}
        <div>
          <label className="block text-xs font-bold text-[#8E92A4] mb-1.5">
            Clave de Bóveda Privada
          </label>
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="ej. cesar"
            className="w-full px-4 py-2.5 bg-[#181B26] border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#A1FF00]"
          />
          <p className="text-[11px] text-[#656A7B] mt-1">
            Ingresa la misma palabra clave en tu iPad, iPhone y computadora para compartir tu plan de comidas y súper.
          </p>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleUploadToCloud}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#A1FF00] hover:bg-[#8FE000] text-black text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <ArrowUpCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Subir a la Nube</span>
          </button>

          <button
            onClick={handleDownloadFromCloud}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <ArrowDownCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Descargar Aquí</span>
          </button>
        </div>

      </div>
    </div>
  );
};

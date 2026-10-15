import React from 'react';
import { 
  Calendar, 
  ShoppingCart, 
  Activity, 
  Plus, 
  Sun, 
  Moon,
  Home,
  UtensilsCrossed,
  Zap,
  FolderArchive,
  ScanLine,
  FileText,
  Trophy
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts';
  onSelectTab: (tab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts') => void;
  onOpenQuickWorkout?: () => void;
  onOpenProfile?: () => void;
  onOpenProfileModal?: () => void;
  userName?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  todayDateStr?: string;
  currentDate?: string;
  onChangeDate?: (date: string) => void;
  onOpenBarcodeScanner?: () => void;
  onOpenWeeklyReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickWorkout,
  onOpenProfile,
  onOpenProfileModal,
  userName = 'Cesar',
  theme,
  onToggleTheme,
  todayDateStr,
  currentDate,
  onOpenBarcodeScanner,
  onOpenWeeklyReport
}) => {
  const effectiveDateStr = currentDate || todayDateStr || new Date().toISOString().split('T')[0];
  const [year, month, day] = effectiveDateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const shortDate = dateObj.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).toUpperCase();

  const handleProfileClick = onOpenProfile || onOpenProfileModal || (() => {});

  return (
    <>
      {/* Top Athletic Header */}
      <header className="sticky top-0 z-40 bg-[#0B0C10]/90 backdrop-blur-2xl border-b border-white/[0.06] px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left Slot: Avatar, "Hello Cesar!" and "Let's start your day" */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleProfileClick}
              className="relative p-0.5 rounded-full border border-white/10 hover:border-white/30 transition-colors cursor-pointer shrink-0 group"
              title="Ajustes de Perfil"
            >
              <div className="w-9 h-9 rounded-full bg-[#181B26] border border-white/10 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#CCFF00] border-2 border-[#0B0C10]" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] sm:text-[17px] font-black text-white tracking-tight">
                  Hello {userName.split(' ')[0]}!
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#7E8494] block leading-tight">
                Let's start your day · {shortDate}
              </span>
            </div>
          </div>

          {/* Center Slot: Athletic Pill Segmented Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#13151D] p-1.5 rounded-full border border-white/[0.06]">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-[#CCFF00] text-black shadow-sm font-extrabold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Hoy</span>
            </button>

            <button
              onClick={() => onSelectTab('planner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'planner'
                  ? 'bg-[#CCFF00] text-black shadow-sm font-extrabold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Dieta Semanal</span>
            </button>

            <button
              onClick={() => onSelectTab('monthly_diets')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'monthly_diets'
                  ? 'bg-[#CCFF00] text-black shadow-sm font-extrabold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Dietas Mes</span>
            </button>

            <button
              onClick={() => onSelectTab('supermarket')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'supermarket'
                  ? 'bg-[#CCFF00] text-black shadow-sm font-extrabold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Súper</span>
            </button>

            <button
              onClick={() => onSelectTab('workouts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'workouts'
                  ? 'bg-[#CCFF00] text-black shadow-sm font-extrabold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Entrenamientos</span>
            </button>
          </nav>

          {/* Right Slot: Streak Trophy, Scanner, Report, Theme & Add CTA */}
          <div className="flex items-center gap-2">
            
            {/* Athletic Trophy Badge */}
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#161822] border border-white/10 text-amber-400 cursor-pointer"
              title="Racha activa de hábitos"
            >
              <Trophy className="w-4 h-4" />
            </div>

            {onOpenBarcodeScanner && (
              <button
                onClick={onOpenBarcodeScanner}
                title="Escanear Código de Barras o Foto (Costco vs HEB vs Walmart)"
                className="p-2 rounded-full bg-[#161822] hover:bg-[#1E2230] border border-white/5 text-white hover:text-[#CCFF00] transition-colors cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
              </button>
            )}

            {onOpenWeeklyReport && (
              <button
                onClick={onOpenWeeklyReport}
                title="Generar Reporte Semanal en PDF o Notas"
                className="p-2 rounded-full bg-[#161822] hover:bg-[#1E2230] border border-white/5 text-white hover:text-sky-400 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded-full bg-[#161822] hover:bg-[#1E2230] border border-white/5 text-[#8E92A4] hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#8E92A4]" />
              )}
            </button>

            {/* Quick Record Workout CTA (Solid Matte Lime) */}
            <button
              onClick={onOpenQuickWorkout}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-black bg-[#CCFF00] hover:bg-[#bbf000] active:scale-95 transition-all rounded-full shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Entreno</span>
            </button>
          </div>

        </div>
      </header>

      {/* Floating Athletic Bottom Dock */}
      <div className="fixed bottom-3.5 left-0 right-0 z-50 px-3 flex justify-center pointer-events-none lg:hidden pb-safe">
        <nav className="pointer-events-auto bg-[#13151D]/95 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 shadow-2xl flex items-center max-w-sm w-full justify-between">
          
          {/* Tab 1: Inicio */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-white font-bold'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Inicio</span>
          </button>

          {/* Tab 2: Dieta Semanal */}
          <button
            onClick={() => onSelectTab('planner')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'planner'
                ? 'text-white font-bold'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Dieta</span>
          </button>

          {/* Center Floating Action Button (Solid Matte Lime) */}
          <button
            onClick={onOpenQuickWorkout}
            title="Registrar Sesión"
            className="w-11 h-11 -mt-3.5 rounded-full bg-[#CCFF00] hover:bg-[#bbf000] text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer shrink-0 border-2 border-[#0B0C10]"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Tab 4: Súper */}
          <button
            onClick={() => onSelectTab('supermarket')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'supermarket'
                ? 'text-white font-bold'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Súper</span>
          </button>

          {/* Tab 5: Entrenamientos */}
          <button
            onClick={() => onSelectTab('workouts')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'workouts'
                ? 'text-white font-bold'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <Zap className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Entrenos</span>
          </button>

        </nav>
      </div>
    </>
  );
};

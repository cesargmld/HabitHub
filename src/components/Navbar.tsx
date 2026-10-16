import React from 'react';
import { 
  Calendar, 
  ShoppingCart, 
  Activity, 
  Plus, 
  Sun, 
  Moon,
  Home,
  FolderArchive,
  ScanLine,
  FileText,
  Trophy,
  Zap,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts';
  onSelectTab: (tab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts') => void;
  onOpenQuickWorkout?: () => void;
  onOpenProfile?: () => void;
  onOpenProfileModal?: () => void;
  onOpenCloudSync?: () => void;
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
  onOpenCloudSync,
  userName = 'Atleta',
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
      {/* Top Header with Liquid Glass & iOS Safe Area Inset Support */}
      <header 
        className="sticky top-0 z-40 bg-[#0A0B0E]/80 backdrop-blur-2xl border-b border-white/[0.06] px-3.5 sm:px-6 transition-colors shadow-sm"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)',
          paddingBottom: '0.65rem'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Slot: Clean Liquid Glass HabitHub Brand Mark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none"
              title="HabitHub - Inicio"
            >
              {/* Liquid Glass HabitHub Icon */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:border-[#A1FF00]/50 transition-all shrink-0">
                <div className="w-4 h-4 flex items-center justify-center text-[#A1FF00] font-black text-sm tracking-tighter">
                  <Activity className="w-4 h-4 stroke-[2.8]" />
                </div>
              </div>

              {/* Brand Wordmark (No PRO, No date clutter) */}
              <div className="flex items-center">
                <span className="text-[17px] sm:text-[19px] font-black tracking-tight text-white leading-none">
                  Habit<span className="text-[#A1FF00]">Hub</span>
                </span>
              </div>
            </button>
          </div>

          {/* Center Slot: Tablet / Desktop Segmented Tabs (iPad & Desktop >= 768px) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#13151D]/90 backdrop-blur-xl p-1 rounded-full border border-white/[0.06]">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-[#A1FF00] text-black shadow-[0_2px_12px_rgba(161,255,0,0.3)] font-extrabold'
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
                  ? 'bg-[#A1FF00] text-black shadow-[0_2px_12px_rgba(161,255,0,0.3)] font-extrabold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Semana</span>
            </button>

            <button
              onClick={() => onSelectTab('monthly_diets')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'monthly_diets'
                  ? 'bg-[#A1FF00] text-black shadow-[0_2px_12px_rgba(161,255,0,0.3)] font-extrabold'
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
                  ? 'bg-[#A1FF00] text-black shadow-[0_2px_12px_rgba(161,255,0,0.3)] font-extrabold'
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
                  ? 'bg-[#A1FF00] text-black shadow-[0_2px_12px_rgba(161,255,0,0.3)] font-extrabold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Entrenos</span>
            </button>
          </nav>

          {/* Right Slot: Multi-Device Sync, Trophy, Scanner & Profile Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Multi-Device Cloud Sync Button */}
            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                title="Sincronizar iPad, iPhone y Web (Mismo Usuario)"
                className="p-2 rounded-full bg-[#161822]/80 hover:bg-[#1E2230] border border-white/10 text-[#00F0FF] hover:text-white transition-colors cursor-pointer"
              >
                <Cloud className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}

            {/* Streak Trophy Badge */}
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#161822]/80 border border-white/10 text-amber-400 cursor-pointer"
              title="Racha activa de hábitos"
            >
              <Trophy className="w-4 h-4" />
            </div>

            {/* Quick Barcode & Photo Scanner */}
            {onOpenBarcodeScanner && (
              <button
                onClick={onOpenBarcodeScanner}
                title="Escanear Código de Barras o Foto (Costco vs HEB)"
                className="p-2 rounded-full bg-[#161822]/80 hover:bg-[#1E2230] border border-white/10 text-white hover:text-[#A1FF00] transition-colors cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
              </button>
            )}

            {/* Weekly PDF Report */}
            {onOpenWeeklyReport && (
              <button
                onClick={onOpenWeeklyReport}
                title="Generar Reporte Semanal en PDF"
                className="hidden sm:inline-flex p-2 rounded-full bg-[#161822]/80 hover:bg-[#1E2230] border border-white/10 text-white hover:text-sky-400 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded-full bg-[#161822]/80 hover:bg-[#1E2230] border border-white/10 text-[#8E92A4] hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#8E92A4]" />
              )}
            </button>

            {/* Quick Workout Button (Liquid Neon Lime) */}
            {onOpenQuickWorkout && (
              <>
                <button
                  onClick={onOpenQuickWorkout}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black bg-[#A1FF00] hover:bg-[#8FE000] active:scale-95 transition-all rounded-full shadow-[0_2px_12px_rgba(161,255,0,0.3)] whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Entreno</span>
                </button>
                <button
                  onClick={onOpenQuickWorkout}
                  title="Registrar Entreno"
                  className="sm:hidden w-8 h-8 rounded-full bg-[#A1FF00] text-black flex items-center justify-center hover:bg-[#8FE000] active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </>
            )}

            {/* User Profile Avatar with Liquid Neon Accent */}
            <button
              onClick={handleProfileClick}
              className="relative p-0.5 rounded-full border border-white/15 hover:border-[#A1FF00] transition-colors cursor-pointer shrink-0 group ml-0.5"
              title={`Perfil: ${userName}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A1FF00] to-[#00F0FF] flex items-center justify-center text-black font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#A1FF00] border-2 border-[#0A0B0E]" />
            </button>

          </div>

        </div>
      </header>

      {/* Floating Athletic Bottom Dock (Only on Phones: md:hidden) */}
      <div 
        className="fixed bottom-2 left-0 right-0 z-50 px-3 flex justify-center pointer-events-none md:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
      >
        <nav className="pointer-events-auto bg-[#13151D]/90 backdrop-blur-2xl border border-white/15 rounded-full px-2.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center max-w-sm w-full justify-around">
          
          {/* Tab 1: Inicio */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-[#A1FF00] font-black'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Inicio</span>
          </button>

          {/* Tab 2: Dieta Semanal */}
          <button
            onClick={() => onSelectTab('planner')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all cursor-pointer ${
              currentTab === 'planner'
                ? 'text-[#A1FF00] font-black'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Semana</span>
          </button>

          {/* Tab 3: Dietas Mes */}
          <button
            onClick={() => onSelectTab('monthly_diets')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all cursor-pointer ${
              currentTab === 'monthly_diets'
                ? 'text-[#A1FF00] font-black'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <FolderArchive className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Dietas</span>
          </button>

          {/* Tab 4: Súper */}
          <button
            onClick={() => onSelectTab('supermarket')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all cursor-pointer ${
              currentTab === 'supermarket'
                ? 'text-[#A1FF00] font-black'
                : 'text-[#6F7485] hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-semibold mt-0.5">Súper</span>
          </button>

          {/* Tab 5: Entrenos */}
          <button
            onClick={() => onSelectTab('workouts')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all cursor-pointer ${
              currentTab === 'workouts'
                ? 'text-[#A1FF00] font-black'
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

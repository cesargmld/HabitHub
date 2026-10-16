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
  Zap
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
      {/* Top Header with iOS Safe Area Inset Support */}
      <header 
        className="sticky top-0 z-40 bg-[#0B0C10]/95 backdrop-blur-2xl border-b border-white/[0.08] px-3 sm:px-6 transition-colors shadow-sm"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)',
          paddingBottom: '0.65rem'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Slot: Official HabitHub Brand Mark & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group focus:outline-none"
              title="HabitHub PRO - Inicio"
            >
              {/* Concentric Fitness Activity Rings Badge */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1C1C1E] to-[#111217] border border-white/10 shadow-sm group-hover:border-white/30 transition-all shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 -rotate-90" viewBox="0 0 36 36">
                  {/* Outer Ring: Move Red (#FA114F) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="14" 
                    fill="none" 
                    stroke="#FA114F" 
                    strokeWidth="2.8" 
                    strokeDasharray="72, 100" 
                    strokeLinecap="round" 
                  />
                  {/* Middle Ring: Exercise Green (#30D158) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="10" 
                    fill="none" 
                    stroke="#30D158" 
                    strokeWidth="2.8" 
                    strokeDasharray="56, 100" 
                    strokeLinecap="round" 
                  />
                  {/* Inner Ring: Stand/Hydration Blue (#0A84FF) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="6" 
                    fill="none" 
                    stroke="#0A84FF" 
                    strokeWidth="2.8" 
                    strokeDasharray="42, 100" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>

              {/* Brand Wordmark & Date */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[16px] sm:text-[18px] font-black tracking-tight text-white leading-none">
                    Habit<span className="text-[#007AFF]">Hub</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/10 text-white rounded">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#7E8494] leading-tight mt-0.5">
                  {shortDate}
                </span>
              </div>
            </button>
          </div>

          {/* Center Slot: Tablet / Desktop Segmented Tabs (iPad & Desktop >= 768px) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#13151D] p-1.5 rounded-full border border-white/[0.08]">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-white text-black shadow-sm font-bold'
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
                  ? 'bg-white text-black shadow-sm font-bold'
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
                  ? 'bg-white text-black shadow-sm font-bold'
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
                  ? 'bg-white text-black shadow-sm font-bold'
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
                  ? 'bg-white text-black shadow-sm font-bold'
                  : 'text-[#8E92A4] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Entrenos</span>
            </button>
          </nav>

          {/* Right Slot: Streak, Quick Actions & Profile Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Streak Trophy Badge */}
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#161822] border border-white/10 text-amber-400 cursor-pointer"
              title="Racha activa de hábitos"
            >
              <Trophy className="w-4 h-4" />
            </div>

            {/* Quick Barcode & Photo Scanner */}
            {onOpenBarcodeScanner && (
              <button
                onClick={onOpenBarcodeScanner}
                title="Escanear Código de Barras o Foto (Costco vs HEB)"
                className="p-2 rounded-full bg-[#161822] hover:bg-[#1E2230] border border-white/5 text-white hover:text-slate-300 transition-colors cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
              </button>
            )}

            {/* Weekly PDF Report (hidden on very small phones to prevent crowding) */}
            {onOpenWeeklyReport && (
              <button
                onClick={onOpenWeeklyReport}
                title="Generar Reporte Semanal en PDF"
                className="hidden sm:inline-flex p-2 rounded-full bg-[#161822] hover:bg-[#1E2230] border border-white/5 text-white hover:text-sky-400 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
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

            {/* Quick Workout Button (Desktop/Tablet pill, Mobile compact icon) */}
            {onOpenQuickWorkout && (
              <>
                <button
                  onClick={onOpenQuickWorkout}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-black bg-white hover:bg-slate-200 active:scale-95 transition-all rounded-full shadow-sm whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Entreno</span>
                </button>
                <button
                  onClick={onOpenQuickWorkout}
                  title="Registrar Entreno"
                  className="sm:hidden w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </>
            )}

            {/* User Profile Avatar */}
            <button
              onClick={handleProfileClick}
              className="relative p-0.5 rounded-full border border-white/10 hover:border-white/30 transition-colors cursor-pointer shrink-0 group ml-0.5"
              title={`Perfil: ${userName}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#181B26] border border-white/10 flex items-center justify-center text-white font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#007AFF] border-2 border-[#0B0C10]" />
            </button>

          </div>

        </div>
      </header>

      {/* Floating Athletic Bottom Dock (Only on Phones: md:hidden) */}
      <div 
        className="fixed bottom-2 left-0 right-0 z-50 px-3 flex justify-center pointer-events-none md:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
      >
        <nav className="pointer-events-auto bg-[#13151D]/95 backdrop-blur-2xl border border-white/10 rounded-full px-2.5 py-1.5 shadow-2xl flex items-center max-w-sm w-full justify-around">
          
          {/* Tab 1: Inicio */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all cursor-pointer ${
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
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all cursor-pointer ${
              currentTab === 'planner'
                ? 'text-white font-bold'
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
                ? 'text-white font-bold'
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
                ? 'text-white font-bold'
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

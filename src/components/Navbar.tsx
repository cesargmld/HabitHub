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
  FileText
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts';
  onSelectTab: (tab: 'dashboard' | 'planner' | 'monthly_diets' | 'supermarket' | 'workouts') => void;
  onOpenQuickWorkout: () => void;
  onOpenProfile: () => void;
  userName: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  todayDateStr: string;
  onOpenBarcodeScanner?: () => void;
  onOpenWeeklyReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickWorkout,
  onOpenProfile,
  userName,
  theme,
  onToggleTheme,
  todayDateStr,
  onOpenBarcodeScanner,
  onOpenWeeklyReport
}) => {
  const [year, month, day] = todayDateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const shortDate = dateObj.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).toUpperCase();

  return (
    <>
      {/* Top Mobile & Desktop Header (Apple Frosted Glass) */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/80 dark:bg-[#000000]/80 backdrop-blur-2xl border-b border-black/[0.05] dark:border-white/[0.08] px-4 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left Slot: User Profile Avatar & App Name */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenProfile}
              className="relative p-0.5 rounded-full border border-black/10 dark:border-white/15 hover:border-[#A1FF00] transition-colors cursor-pointer shrink-0"
              title="Ajustes de Perfil"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A1FF00] to-[#00F0FF] flex items-center justify-center text-black font-extrabold text-[12px] shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#A1FF00] border-2 border-white dark:border-black" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block leading-none">
                {shortDate}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[16px] font-extrabold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                  Habithub
                </span>
              </div>
            </div>
          </div>

          {/* Center Slot (Desktop Segmented Bar, hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F2F2F7] dark:bg-[#1C1C1E] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#A1FF00] shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Hoy & Anillos</span>
            </button>

            <button
              onClick={() => onSelectTab('planner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                currentTab === 'planner'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#A1FF00] shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Dieta Semanal</span>
            </button>

            <button
              onClick={() => onSelectTab('monthly_diets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                currentTab === 'monthly_diets'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#A1FF00] shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Dietas por Mes</span>
            </button>

            <button
              onClick={() => onSelectTab('supermarket')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                currentTab === 'supermarket'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#A1FF00] shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Despensa Súper</span>
            </button>

            <button
              onClick={() => onSelectTab('workouts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                currentTab === 'workouts'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#A1FF00] shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Entrenamientos</span>
            </button>
          </nav>

          {/* Right Slot: Quick Scanner, Report, Theme Switcher & Quick Workout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {onOpenBarcodeScanner && (
              <button
                onClick={onOpenBarcodeScanner}
                title="Escanear Código de Barras (HEB vs Costco)"
                className="p-2 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.08] text-[#1C1C1E] dark:text-[#A1FF00] transition-colors cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
              </button>
            )}

            {onOpenWeeklyReport && (
              <button
                onClick={onOpenWeeklyReport}
                title="Generar Reporte Semanal en PDF o Notas"
                className="p-2 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.08] text-[#1C1C1E] dark:text-[#007AFF] transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.08] text-[#1C1C1E] dark:text-[#F5F5F7] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFD60A]" />
              ) : (
                <Moon className="w-4 h-4 text-[#8E8E93]" />
              )}
            </button>

            {/* Quick Record Workout CTA */}
            <button
              onClick={onOpenQuickWorkout}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold text-black bg-[#A1FF00] hover:bg-[#8FE000] active:scale-95 transition-all rounded-full shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Entreno</span>
            </button>
          </div>

        </div>
      </header>

      {/* Floating Bottom iOS Tab Bar (iPhone thumb-zone with Apple frosted glass) */}
      <div className="fixed bottom-3.5 left-0 right-0 z-50 px-3 flex justify-center pointer-events-none md:hidden pb-safe">
        <nav className="pointer-events-auto bg-[#FFFFFF]/85 dark:bg-[#1C1C1E]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.1] rounded-full px-2.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center gap-1 max-w-sm w-full justify-around">
          
          {/* Tab 1: Inicio */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-[#007AFF] dark:text-[#A1FF00] font-bold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-medium mt-0.5">Inicio</span>
          </button>

          {/* Tab 2: Dieta */}
          <button
            onClick={() => onSelectTab('planner')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'planner'
                ? 'text-[#007AFF] dark:text-[#A1FF00] font-bold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-medium mt-0.5">Semana</span>
          </button>

          {/* Tab 3: Dietas Mensuales */}
          <button
            onClick={() => onSelectTab('monthly_diets')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'monthly_diets'
                ? 'text-[#007AFF] dark:text-[#A1FF00] font-bold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
          >
            <FolderArchive className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-medium mt-0.5">Dietas</span>
          </button>

          {/* Center Floating Action Button (Apple Neon Green Quick Add) */}
          <button
            onClick={onOpenQuickWorkout}
            title="Registrar Sesión"
            className="w-10 h-10 -mt-2.5 rounded-full bg-[#A1FF00] hover:bg-[#8FE000] text-black flex items-center justify-center shadow-[0_4px_16px_rgba(161,255,0,0.35)] active:scale-95 transition-transform cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Tab 4: Súper */}
          <button
            onClick={() => onSelectTab('supermarket')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'supermarket'
                ? 'text-[#007AFF] dark:text-[#A1FF00] font-bold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-medium mt-0.5">Súper</span>
          </button>

          {/* Tab 5: Entrenamientos */}
          <button
            onClick={() => onSelectTab('workouts')}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all cursor-pointer ${
              currentTab === 'workouts'
                ? 'text-[#007AFF] dark:text-[#A1FF00] font-bold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
          >
            <Zap className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-medium mt-0.5">Entrenos</span>
          </button>

        </nav>
      </div>
    </>
  );
};

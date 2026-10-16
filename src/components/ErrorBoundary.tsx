import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in HabitHub component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleClearStorage = () => {
    if (window.confirm('¿Deseas restablecer los datos locales por defecto para recuperar la app?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0B0E] text-white flex items-center justify-center p-4">
          <div className="bg-[#13151D] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Se detectó un detalle en la vista
                </h2>
                <p className="text-xs text-[#8E92A4]">
                  HabitHub aisló el error para proteger tus datos
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-red-300 break-words">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-white text-black hover:bg-slate-200 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar / Recargar</span>
              </button>
              <button
                onClick={this.handleClearStorage}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1F2330] hover:bg-[#2A2F42] text-[#8E92A4] hover:text-white border border-white/5 cursor-pointer transition-colors"
              >
                Restablecer datos
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

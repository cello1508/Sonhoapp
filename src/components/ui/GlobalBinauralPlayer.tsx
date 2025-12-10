import { X, Minimize2, Waves } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export function GlobalBinauralPlayer() {
    const { isActive, isMinimized, timeLeft, stopSession, minimizeSession, maximizeSession } = useSound();

    if (!isActive) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // FLOATING WIDGET (Minimized)
    if (isMinimized) {
        return (
            <div className="fixed bottom-24 right-4 z-[60] flex flex-col items-end gap-2 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <button
                    onClick={maximizeSession}
                    className="group relative flex items-center bg-slate-900 border border-dream-500/50 rounded-full px-4 py-3 shadow-2xl shadow-dream-500/20 hover:scale-105 transition-all"
                >
                    <div className="absolute inset-0 bg-dream-500/10 rounded-full animate-pulse" />

                    {/* Ripple Effect */}
                    <div className="absolute -inset-1 border border-dream-500/20 rounded-full animate-ping opacity-20" />

                    <div className="flex items-center gap-3 relative z-10">
                        <Waves className="w-4 h-4 text-dream-400 animate-pulse" />
                        <span className="text-sm font-bold text-white font-mono tabular-nums tracking-wider text-nowrap">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </button>
            </div>
        );
    }

    // FULL MODAL (Maximized/Intro)
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl overflow-hidden">

                {/* Header Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                        onClick={minimizeSession}
                        className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
                        title="Minimizar (Continuar ouvindo)"
                    >
                        <Minimize2 size={18} />
                    </button>
                    <button
                        onClick={() => stopSession()}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-white/5 rounded-full hover:bg-white/10"
                        title="Fechar e Parar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center space-y-6 mt-4">

                    {/* Timer Circle */}
                    <div className="relative w-40 h-40 flex items-center justify-center mt-4">
                        {/* Rings Animation */}
                        <div className="absolute inset-0 border-4 border-dream-500/20 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
                        <div className="absolute inset-0 border-4 border-dream-500/10 rounded-full animate-[ping_3s_ease-in-out_infinite_delay-1000]" />
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />

                        <div className="flex flex-col items-center relative z-10">
                            <span className="text-5xl font-bold text-white font-mono tracking-wider tabular-nums drop-shadow-lg">
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-[10px] text-dream-400 font-bold uppercase tracking-widest mt-1">Sessão Ativa</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-medium text-white">Frequência Gamma (40Hz)</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                            Sintonizando sua mente para lucidez. Respire fundo.
                        </p>
                    </div>

                    <div className="w-full pt-4">
                        <button
                            onClick={minimizeSession}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-white/5"
                        >
                            Minimizar e Continuar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

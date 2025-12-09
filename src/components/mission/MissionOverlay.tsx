import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, Trophy } from 'lucide-react';
import { type LucidityTask } from '../../data/lucidityTasks';
import { useApp } from '../../context/AppContext';

interface MissionOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: LucidityTask[];
    category: 'morning' | 'day' | 'night' | null;
}

export function MissionOverlay({ isOpen, onClose, tasks, category }: MissionOverlayProps) {
    const { completeMission } = useApp();
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Filter to limit tasks per session (e.g. 3 tasks max)
    const sessionTasks = useMemo(() => {
        // Shuffle and take 3 for brevity, or take all passed
        return tasks.slice(0, 3);
    }, [tasks]);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentTaskIndex(0);
            setIsCompleted(false);
            setShowSuccess(false);
        }
    }, [isOpen]);

    const currentTask = sessionTasks[currentTaskIndex];
    const progress = ((currentTaskIndex) / sessionTasks.length) * 100;

    const handleNext = () => {
        if (!currentTask) return;

        if (currentTaskIndex < sessionTasks.length - 1) {
            setCurrentTaskIndex(prev => prev + 1);
            setIsCompleted(false);
        } else {
            // Mission Complete!
            setShowSuccess(true);
            const totalXP = sessionTasks.reduce((acc, t) => acc + t.xp, 0);
            if (category) {
                completeMission(category, totalXP);
            }
        }
    };

    if (!isOpen || !category) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-6 flex items-center space-x-4">
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-dream-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
                    {!showSuccess ? (
                        <AnimatePresence mode="wait">
                            {currentTask && (
                                <motion.div
                                    key={currentTask.id}
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -50, opacity: 0 }}
                                    className="w-full max-w-md flex flex-col items-center text-center space-y-6"
                                >
                                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-2xl mb-2">
                                        <currentTask.icon size={48} className="text-dream-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-white leading-tight">{currentTask.title}</h2>
                                        <p className="text-slate-400 text-base leading-relaxed px-4">{currentTask.description}</p>
                                    </div>

                                    {/* Interaction Area */}
                                    <div className="w-full space-y-4 pt-2">
                                        {currentTask.type === 'action' && (
                                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-700">
                                                <p className="text-indigo-300 font-bold">Faça isso agora</p>
                                            </div>
                                        )}

                                        {currentTask.type === 'question' && currentTask.questionOptions && (
                                            <div className="grid gap-3">
                                                {currentTask.questionOptions.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setIsCompleted(true)}
                                                        className={`p-4 rounded-xl border font-medium transition-all text-left flex items-center justify-between ${isCompleted ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                                                    >
                                                        <span>{opt}</span>
                                                        {isCompleted && <Check size={18} className="text-indigo-400" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {currentTask.type === 'info' && (
                                            <div className="bg-indigo-950/30 p-6 rounded-2xl border border-indigo-500/30">
                                                <p className="text-indigo-200">{currentTask.infoContent}</p>
                                            </div>
                                        )}
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <SuccessView onClose={onClose} xpEarned={sessionTasks.reduce((acc, t) => acc + t.xp, 0)} />
                    )}
                </div>

                {/* Footer */}
                {!showSuccess && currentTask && (
                    <div className="p-6 pb-12 border-t border-slate-900 bg-slate-950">
                        <button
                            onClick={handleNext}
                            disabled={currentTask.type === 'question' && !isCompleted}
                            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${(currentTask.type === 'question' && !isCompleted)
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-400 text-slate-950 shadow-lg shadow-green-500/20'
                                }`}
                        >
                            <span>{currentTaskIndex === sessionTasks.length - 1 ? 'Finalizar' : 'Continuar'}</span>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

function SuccessView({ onClose, xpEarned }: { onClose: () => void, xpEarned: number }) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center space-y-6"
        >
            <div className="w-40 h-40 bg-yellow-500/20 rounded-full flex items-center justify-center relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-yellow-500/50 rounded-full"
                />
                <Trophy size={80} className="text-yellow-400" />
            </div>

            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Missão Cumprida!</h2>
                <p className="text-slate-400">Você está mais perto da lucidez.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl px-8 py-4">
                <span className="text-4xl font-bold text-yellow-400">+{xpEarned} XP</span>
            </div>

            <button
                onClick={onClose}
                className="w-full bg-slate-800 border border-slate-700 text-white font-bold py-4 px-12 rounded-2xl hover:bg-slate-700 transition-colors"
            >
                Continuar
            </button>
        </motion.div>
    )
}

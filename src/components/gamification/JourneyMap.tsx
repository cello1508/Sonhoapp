import { useMemo } from 'react';
import { type LucidityTask } from '../../data/lucidityTasks';
import { Check, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface JourneyMapProps {
    tasks: LucidityTask[];
    completedTaskIds: string[];
    onTaskSelect: (task: LucidityTask) => void;
}

export function JourneyMap({ tasks, completedTaskIds, onTaskSelect }: JourneyMapProps) {
    // Configuration for the path
    const STEP_HEIGHT = 100;
    const AMPLITUDE = 60; // How wide the curve is
    const CENTER_X = 50; // Percentage

    // Calculate node positions
    const nodes = useMemo(() => {
        return tasks.map((task, index) => {
            const y = index * STEP_HEIGHT + 50; // Start with some padding
            // Use sine wave for x position
            // We want the path to snake.
            // Math.sin takes radians. We want a full cycle every few items?
            // Let's say one Left-Right-Left cycle every 4 items.
            const xOffset = Math.sin((index / 2) * Math.PI) * AMPLITUDE;

            return {
                ...task,
                xPercent: CENTER_X + (xOffset / 3), // Scale down relative to container width?
                // Let's just use pixel offsets from center if we assume container is roughly 300-400px
                // Ideally we use percentages for responsiveness.
                // 50% +/- 30%?
                x: 50 + (Math.sin((index / 2) * Math.PI) * 30), // 20% to 80% range
                y,
                isCompleted: completedTaskIds.includes(task.id),
                // Simple unlock logic: if previous is completed (or it's the first one)
                isLocked: index > 0 && !completedTaskIds.includes(tasks[index - 1].id) && !completedTaskIds.includes(task.id)
            };
        });
    }, [tasks, completedTaskIds]);

    const totalHeight = nodes.length * STEP_HEIGHT + 100;

    // Generate SVG path string
    // M x1 y1 Q cx cy x2 y2 ...
    // We need curved lines between nodes.
    const pathData = useMemo(() => {
        if (nodes.length === 0) return '';

        let d = `M ${nodes[0].x}% ${nodes[0].y}`;

        for (let i = 0; i < nodes.length - 1; i++) {
            const current = nodes[i];
            const next = nodes[i + 1];

            const midY = (current.y + next.y) / 2;

            // Cubic bezier for smoothness
            // Control points: vertical out from current, vertical into next
            d += ` C ${current.x}% ${midY}, ${next.x}% ${midY}, ${next.x}% ${next.y}`;
        }

        return d;
    }, [nodes]);

    return (
        <div className="relative w-full max-w-md mx-auto" style={{ height: totalHeight }}>
            {/* The Connected Path */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
                {/* Background Line (Gray) */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="#1e293b" // slate-800
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="opacity-50"
                />
                {/* Progress Line (Colored) - Optional complex logic, for now simple gray path */}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => {
                const Icon = node.icon;

                // Color Logic based on Category
                let bgClass = "bg-slate-800";
                let ringClass = "ring-slate-700";
                let iconColor = "text-slate-400";

                if (node.category === 'morning') {
                    if (node.isCompleted) { bgClass = "bg-orange-500"; ringClass = "ring-orange-600/30"; iconColor = "text-white"; }
                    else if (!node.isLocked) { bgClass = "bg-orange-600"; ringClass = "ring-orange-500/30"; iconColor = "text-white"; }
                } else if (node.category === 'day') {
                    if (node.isCompleted) { bgClass = "bg-blue-500"; ringClass = "ring-blue-600/30"; iconColor = "text-white"; }
                    else if (!node.isLocked) { bgClass = "bg-blue-600"; ringClass = "ring-blue-500/30"; iconColor = "text-white"; }
                } else {
                    if (node.isCompleted) { bgClass = "bg-purple-500"; ringClass = "ring-purple-600/30"; iconColor = "text-white"; }
                    else if (!node.isLocked) { bgClass = "bg-purple-600"; ringClass = "ring-purple-500/30"; iconColor = "text-white"; }
                }

                if (node.isLocked) {
                    bgClass = "bg-slate-800";
                    ringClass = "ring-slate-700";
                    iconColor = "text-slate-600";
                }

                return (
                    <motion.button
                        key={node.id}
                        className={`absolute w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-b-4 border-black/30 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all active:scale-95 active:border-b-0 active:translate-y-[-45%] ${bgClass} ring-4 ${ringClass}`}
                        style={{ left: `${node.x}%`, top: node.y }}
                        onClick={() => !node.isLocked && onTaskSelect(node)}
                        disabled={node.isLocked && !node.isCompleted} // Allow re-opening? Maybe
                        whileHover={{ scale: node.isLocked ? 1 : 1.1 }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        {/* Shine effect */}
                        <div className="absolute top-1 right-2 w-3 h-3 bg-white/20 rounded-full" />

                        {node.isCompleted ? (
                            <Check size={28} className="text-white drop-shadow-md" strokeWidth={3} />
                        ) : node.isLocked ? (
                            <Lock size={24} className={iconColor} />
                        ) : (
                            <Icon size={28} className={`${iconColor} drop-shadow-md`} strokeWidth={2.5} />
                        )}

                        {/* Star Rating or Level? */}
                        {node.isCompleted && (
                            <div className="absolute -bottom-8 flex space-x-1">
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        )}

                        {/* Current Indicator */}
                        {!node.isLocked && !node.isCompleted && i === completedTaskIds.length && (
                            <div className="absolute -top-12 bg-white text-slate-900 px-3 py-1 rounded-xl text-xs font-bold animate-bounce shadow-lg">
                                COMEÇAR
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { StatsHeader } from '../components/gamification/StatsHeader';
import { LUCIDITY_TASKS, type LucidityTask } from '../data/lucidityTasks';
import { MissionOverlay } from '../components/mission/MissionOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Sun, Moon, Sparkles, Play, Zap } from 'lucide-react';

export function Dashboard() {
    const { stats } = useApp();
    const tasks = LUCIDITY_TASKS;

    const [showMission, setShowMission] = useState(false);

    // Random Daily Mission: Select 3-5 tasks based on date to keep it consistent for the day
    // (Simplification: Just randomization for now, ideally seeded by date)
    const dailyMissionTasks = useMemo(() => {
        const shuffled = [...tasks].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5); // Take 5 random tasks
    }, []);

    // Categorize for the "Library" view
    const dayTasks = tasks.filter(t => t.category === 'day');
    const nightTasks = tasks.filter(t => t.category === 'night' && t.id !== 'wbtb_lite' && t.id !== 'reentry');
    const advTasks = tasks.filter(t => t.id === 'wbtb_lite' || t.id === 'reentry');

    return (
        <MobileLayout>
            <div className="pb-24">
                <StatsHeader stats={stats} />

                <div className="px-6 mt-6 mb-8">
                    <button
                        onClick={() => setShowMission(true)}
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-1 shadow-2xl shadow-indigo-500/30"
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                        <div className="relative bg-slate-900/40 backdrop-blur-sm rounded-[22px] p-6 flex items-center justify-between">
                            <div className="text-left">
                                <div className="flex items-center space-x-2 text-indigo-300 mb-1">
                                    <Zap size={16} fill="currentColor" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Missão Diária</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white leading-tight">Iniciar Treino<br />de Lucidez</h2>
                            </div>
                            <div className="w-14 h-14 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play size={28} fill="currentColor" className="ml-1" />
                            </div>
                        </div>
                    </button>
                </div>

                <div className="px-6 space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="h-px bg-slate-800 flex-1" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Biblioteca de Técnicas</span>
                        <div className="h-px bg-slate-800 flex-1" />
                    </div>

                    <TaskSection
                        title="Hábito e Questionamento"
                        subtitle="Durante o dia"
                        icon={Sun}
                        tasks={dayTasks}
                        color="text-yellow-400"
                    />

                    <TaskSection
                        title="Antes de Dormir"
                        subtitle="Preparação Mental"
                        icon={Moon}
                        tasks={nightTasks}
                        color="text-indigo-400"
                    />

                    <TaskSection
                        title="Madrugada Avançada"
                        subtitle="Técnicas Poderosas"
                        icon={Sparkles}
                        tasks={advTasks}
                        color="text-purple-400"
                    />
                </div>
            </div>

            <MissionOverlay
                isOpen={showMission}
                onClose={() => setShowMission(false)}
                tasks={dailyMissionTasks}
            />
        </MobileLayout>
    );
}

function TaskSection({ title, subtitle, icon: Icon, tasks, color }: { title: string, subtitle: string, icon: any, tasks: LucidityTask[], color: string }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-none">{title}</h2>
                    <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
                </div>
            </div>

            <div className="space-y-3">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}

function TaskCard({ task }: { task: LucidityTask }) {
    const { stats, toggleTask } = useApp();
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if completed today. 
    // Logic note: CompletedCompletedTasks resets daily in context logic (assumed, need to ensure later)
    // For now purely visual based on ID presence
    const isCompleted = stats.completedTasks?.includes(task.id);

    return (
        <motion.div
            layout
            className={`relative overflow-hidden rounded-2xl border transition-all ${isCompleted ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-slate-900 border-slate-800'}`}
        >
            <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`p-3 rounded-xl ${isCompleted ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    <task.icon size={20} />
                </div>

                <div className="flex-1">
                    <h3 className={`font-bold text-sm ${isCompleted ? 'text-indigo-200 line-through decoration-indigo-500/50' : 'text-slate-200'}`}>
                        {task.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                            +{task.xp} XP
                        </span>
                        {!isExpanded && <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{task.description}</span>}
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id, task.xp);
                    }}
                    className={`p-2 rounded-full transition-all ${isCompleted ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-600 hover:bg-slate-800'}`}
                >
                    {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20"
                    >
                        <div className="p-4 pt-0 text-sm text-slate-400 border-t border-white/5 mt-2 pt-3">
                            {task.description}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

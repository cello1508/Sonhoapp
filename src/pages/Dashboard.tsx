import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { StatsHeader } from '../components/gamification/StatsHeader';
import { LUCIDITY_TASKS, type LucidityTask } from '../data/lucidityTasks';
import { MissionOverlay } from '../components/mission/MissionOverlay';
import { useMemo, useState } from 'react';
import { Play, Zap, Sun, Moon, CheckCircle2 } from 'lucide-react';

export function Dashboard() {
    const { stats } = useApp();
    const tasks = LUCIDITY_TASKS;

    const [activeMission, setActiveMission] = useState<'morning' | 'day' | 'night' | null>(null);

    // Filter tasks by category
    const morningTasks = useMemo(() => tasks.filter(t => t.category === 'morning'), [tasks]);
    const dayTasks = useMemo(() => tasks.filter(t => t.category === 'day'), [tasks]);
    const nightTasks = useMemo(() => tasks.filter(t => t.category === 'night'), [tasks]);

    const getMissionStatus = (category: 'morning' | 'day' | 'night') => {
        const today = new Date().toDateString();
        const lastDate = stats.lastMissionDates?.[category];
        return lastDate === today ? 'completed' : 'active';
    };

    const MissionCard = ({ category, title, icon: Icon, color, tasksForMission }: { category: 'morning' | 'day' | 'night', title: string, icon: any, color: string, tasksForMission: LucidityTask[] }) => {
        const status = getMissionStatus(category);
        const isCompleted = status === 'completed';

        // Select 3 random tasks for this session if Active, otherwise irrelevant
        // In a real app we might want to store THESE specific 3 tasks for the day too.
        // For MVP, we pass all available tasks to overlay, and overlay picks or we pick here.
        // Let's pass all relevant tasks to overlay and let it cycle user through them (or subset).

        return (
            <button
                disabled={isCompleted}
                onClick={() => setActiveMission(category)}
                className={`w-full relative overflow-hidden rounded-2xl p-1 transition-all duration-300 ${isCompleted ? 'opacity-70 grayscale' : 'hover:scale-[1.02] shadow-xl'}`}
            >
                <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20`} />
                <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between border border-white/5">
                    <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-full ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white'}`}>
                            {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-400">
                                    {isCompleted ? 'Concluído por hoje' : `${tasksForMission.length} tarefas disponíveis`}
                                </span>
                            </div>
                        </div>
                    </div>
                    {!isCompleted && (
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <Play size={18} fill="currentColor" className="text-white" />
                        </div>
                    )}
                </div>
            </button>
        );
    };

    return (
        <MobileLayout>
            <div className="pb-24">
                <StatsHeader stats={stats} />

                <div className="px-6 mt-8 space-y-4">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Missões do Dia</h2>

                    <MissionCard
                        category="morning"
                        title="Despertar & Recall"
                        icon={Sun}
                        color="from-orange-500 to-yellow-500"
                        tasksForMission={morningTasks}
                    />

                    <MissionCard
                        category="day"
                        title="Lucidez Ativa"
                        icon={Zap}
                        color="from-blue-500 to-indigo-500"
                        tasksForMission={dayTasks}
                    />

                    <MissionCard
                        category="night"
                        title="Preparação Noturna"
                        icon={Moon}
                        color="from-purple-500 to-indigo-900"
                        tasksForMission={nightTasks}
                    />
                </div>
            </div>

            <MissionOverlay
                isOpen={!!activeMission}
                onClose={() => setActiveMission(null)}
                tasks={
                    activeMission === 'morning' ? morningTasks :
                        activeMission === 'day' ? dayTasks :
                            activeMission === 'night' ? nightTasks : []
                }
                category={activeMission}
            />
        </MobileLayout>
    );
}

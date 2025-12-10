import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { StatsHeader } from '../components/gamification/StatsHeader';
import { LUCIDITY_TASKS, type LucidityTask } from '../data/lucidityTasks';
import { MissionOverlay } from '../components/mission/MissionOverlay';
import { useMemo, useState } from 'react';
import { JourneyMap } from '../components/gamification/JourneyMap';

export function Dashboard() {
    const { stats } = useApp();
    const tasks = LUCIDITY_TASKS;

    const [selectedTask, setSelectedTask] = useState<LucidityTask | null>(null);

    // Helper to randomize array
    const randomizeTasks = (allTasks: LucidityTask[], count: number) => {
        return [...allTasks].sort(() => 0.5 - Math.random()).slice(0, count);
    };

    // Filter and randomize tasks by category (memoized to prevent reshuffle on every render)
    const morningTasks = useMemo(() => randomizeTasks(tasks.filter(t => t.category === 'morning'), 5), [tasks]);
    const dayTasks = useMemo(() => randomizeTasks(tasks.filter(t => t.category === 'day'), 5), [tasks]);
    const nightTasks = useMemo(() => randomizeTasks(tasks.filter(t => t.category === 'night'), 5), [tasks]);

    // Combine for Journey
    const dailyJourneyTasks = useMemo(() => {
        return [...morningTasks, ...dayTasks, ...nightTasks];
    }, [morningTasks, dayTasks, nightTasks]);

    return (
        <MobileLayout>
            <div className="pb-24">
                <StatsHeader stats={stats} />

                <div className="px-4 mt-6">
                    <div className="bg-slate-900/50 rounded-3xl p-4 min-h-[500px] border border-slate-800/50 relative overflow-hidden">
                        {/* Background ambience or decorative elements could go here */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>

                        <JourneyMap
                            tasks={dailyJourneyTasks}
                            completedTaskIds={stats.completedTasks || []}
                            onTaskSelect={(task) => setSelectedTask(task)}
                        />
                    </div>
                </div>
            </div>

            <MissionOverlay
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                tasks={selectedTask ? [selectedTask] : []}
                category={selectedTask?.category || null}
            />
        </MobileLayout>
    );
}

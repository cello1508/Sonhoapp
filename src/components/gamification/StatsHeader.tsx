import { Flame, Sparkles } from 'lucide-react';
import type { UserStats } from '../../types';

export function StatsHeader({ stats }: { stats: UserStats }) {
    return (
        <div className="flex items-center space-x-4 px-4 py-2 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-md mx-6 -mt-2 mb-6">
            <div className="flex items-center space-x-1.5 ">
                <Flame className={`w-5 h-5 ${stats.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-600'}`} />
                <span className={`font-bold ${stats.streak > 0 ? 'text-orange-500' : 'text-slate-500'}`}>{stats.streak}</span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center space-x-1.5 flex-1">
                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <div className="flex flex-col w-full">
                    <div className="flex justify-between text-xs font-medium text-yellow-400">
                        <span>Lvl {stats.level}</span>
                        <span>{stats.xp} XP</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                            className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(stats.xp % 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

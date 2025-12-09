import { Sparkles, Moon, Clock } from 'lucide-react';
import type { UserStats } from '../../types';
import { useApp } from '../../context/AppContext';
import { useState, useEffect } from 'react';

function Countdown({ bedtime }: { bedtime?: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        if (!bedtime) return;

        const calculateTime = () => {
            const now = new Date();
            const [hours, minutes] = bedtime.split(':').map(Number);
            const target = new Date(now);
            target.setHours(hours, minutes, 0, 0);

            if (target < now) {
                // If target is earlier today, assumes it's for tomorrow unless it's late night
                // Logic: If bedtime is 23:00 and now is 01:00, target (today 23:00) is > now? No.
                // If now is 23:30, target (23:00) < now.
                // If now is 01:00, we probably meant yesterday's bedtime? Or tomorrow's?
                // Simple logic: Target is always NEXT occurence of that time.
                target.setDate(target.getDate() + 1);
            }

            // Correction: If now is 01:00 and bedtime is 23:00, we want to show 22h left.
            // If now is 23:30 and bedtime is 23:00, we missed it by 30 mins -> "VÁ DORMIR"

            // Revised Logic for "Go to Sleep":
            // Define a window, e.g., 2 hours after bedtime, where we show "GO TO SLEEP".
            // Otherwise show time until next bedtime.

            const nowTime = now.getHours() * 60 + now.getMinutes();
            const bedTimeMins = hours * 60 + minutes;

            let diffMins = bedTimeMins - nowTime;

            // If within 3 hours AFTER bedtime (late)
            if (diffMins < 0 && diffMins > -180) {
                setIsLate(true);
                setTimeLeft('VÁ DORMIR!');
                return;
            }

            setIsLate(false);

            if (diffMins < 0) {
                diffMins += 24 * 60; // Next day
            }

            const h = Math.floor(diffMins / 60);
            const m = diffMins % 60;
            setTimeLeft(`${h}h ${m}m`);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [bedtime]);

    if (!bedtime) return null;

    return (
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${isLate ? 'bg-red-500/20 border-red-500 text-red-200 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <Clock size={14} />
            <span className="text-xs font-bold text-nowrap">{isLate ? 'DORMIR!' : timeLeft}</span>
        </div>
    );
}

export function StatsHeader({ stats }: { stats: UserStats }) {
    const { lucidProbability } = useApp();

    return (
        <div className="flex flex-col space-y-3 px-4 py-2 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-md mx-6 -mt-2 mb-6">

            {/* Top Row: Probability & Countdown */}
            <div className="flex items-center justify-between w-full">
                {/* Probability Meter */}
                <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="16" cy="16" r="14" fill="none" stroke="#1e293b" strokeWidth="4" />
                            <circle
                                cx="16" cy="16" r="14"
                                fill="none"
                                stroke={lucidProbability > 50 ? '#8b5cf6' : '#3b82f6'}
                                strokeWidth="4"
                                strokeDasharray={`${lucidProbability * 0.88} 100`} // Approx circumference
                                strokeLinecap="round"
                            />
                        </svg>
                        <Moon size={12} className="absolute text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chance</span>
                        <span className="text-lg font-bold text-white leading-none">{Math.round(lucidProbability)}%</span>
                    </div>
                </div>

                {/* Countdown */}
                <Countdown bedtime={stats.bedtime} />
            </div>

            {/* Bottom Row: XP Progress */}
            <div className="flex items-center space-x-2 w-full pt-2 border-t border-slate-800">
                <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex flex-col w-full">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span className="text-yellow-400">Nível {stats.level}</span>
                        <span>{stats.xp % 100}/100 XP</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(stats.xp % 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

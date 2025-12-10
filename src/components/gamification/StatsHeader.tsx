import { Sparkles, Moon, Clock, Volume2, VolumeX } from 'lucide-react';
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

import { useSound } from '../../context/SoundContext';

interface StatsHeaderProps {
    stats: UserStats;
}

export function StatsHeader({ stats }: StatsHeaderProps) {
    const { lucidProbability } = useApp();
    const { isActive, startSession, maximizeSession } = useSound();

    const handleSoundClick = () => {
        if (isActive) {
            maximizeSession();
        } else {
            startSession();
        }
    };

    return (
        <div className="pt-8 px-6 pb-2 relative z-20">

            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl flex flex-col space-y-4 p-4 border border-slate-800 shadow-lg relative">

                {/* Binaural Session Trigger */}
                <button
                    onClick={handleSoundClick}
                    className={`absolute -top-3 -right-2 w-10 h-10 border-2 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 ${isActive ? 'bg-dream-500 border-dream-400 text-white shadow-dream-500/40' : 'bg-slate-800 border-slate-700 text-dream-400'}`}
                >
                    {isActive ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} />}
                </button>

                {/* Top Row: Probability & Countdown */}
                <div className="flex items-center justify-between w-full">
                    {/* Probability Meter */}
                    <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="20" cy="20" r="16" fill="none" stroke="#1e293b" strokeWidth="4" />
                                <circle
                                    cx="20" cy="20" r="16"
                                    fill="none"
                                    stroke={lucidProbability > 50 ? '#8b5cf6' : '#3b82f6'}
                                    strokeWidth="4"
                                    strokeDasharray={`${lucidProbability * 1.0} 100`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <Moon size={14} className="absolute text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Chance</span>
                            <span className="text-xl font-bold text-white leading-none">{Math.round(lucidProbability)}%</span>
                        </div>
                    </div>

                    {/* Countdown */}
                    <Countdown bedtime={stats.bedtime} />
                </div>

                {/* Bottom Row: XP Progress */}
                <div className="flex items-center space-x-3 w-full pt-3 border-t border-white/5">
                    <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="flex flex-col w-full space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="text-yellow-500">Nível {stats.level}</span>
                            <span>{stats.xp % 100}/100 XP</span>
                        </div>
                        <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden ring-1 ring-white/5">
                            <div
                                className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                                style={{ width: `${(stats.xp % 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

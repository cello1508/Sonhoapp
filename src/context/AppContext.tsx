import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Dream, UserStats } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

const DREAMS_KEY = 'dreamlab_dreams';
const STATS_KEY = 'dreamlab_stats';

const DEFAULT_STATS: UserStats = {
    xp: 0,
    level: 1,
    streak: 0,
    lastJournalDate: null,
    dreamsRecorded: 0,
    dailyActions: 0,
    bedtime: '23:00',
    lastMissionDates: {
        morning: null,
        day: null,
        night: null
    }
};

interface AppContextType {
    dreams: Dream[];
    stats: UserStats;
    addDream: (dream: Omit<Dream, 'id' | 'date'>) => void;
    deleteDream: (id: string) => void;
    hasCompletedOnboarding: boolean;
    completeOnboarding: (name: string, bedtime?: string) => void;
    syncDreams: (userId: string) => Promise<void>;
    updateBedtime: (time: string) => void;
    toggleTask: (taskId: string, xpReward: number) => void;
    completeMission: (category: 'morning' | 'day' | 'night', xpEarned: number) => void;
    lucidProbability: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [dreams, setDreams] = useState<Dream[]>(() => {
        const saved = localStorage.getItem(DREAMS_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [stats, setStats] = useState<UserStats>(() => {
        const saved = localStorage.getItem(STATS_KEY);
        // Merge to ensure new fields like lastMissionDates exist
        return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    });

    const [lucidProbability, setLucidProbability] = useState(15);

    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
        return localStorage.getItem('dreamlab_onboarding_completed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    }, [dreams]);

    useEffect(() => {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        calculateProbability();

        // Sync to Supabase if user is logged in
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                authService.updateUserStats(data.user.id, stats);
            }
        });
    }, [stats]);

    const calculateProbability = () => {
        let prob = 15;
        prob += Math.min(stats.dailyActions * 10, 50);
        prob += Math.min(stats.streak * 2, 30);
        setLucidProbability(Math.min(prob, 95));
    };

    const awardXP = (amount: number) => {
        setStats(prev => {
            const newXP = prev.xp + amount;
            const newLevel = Math.floor(newXP / 100) + 1;
            return { ...prev, xp: newXP, level: newLevel };
        });
    };

    const recordAction = () => {
        const today = new Date().toDateString();

        setStats(prev => {
            let newStreak = prev.streak;
            let dailyActions = prev.dailyActions;

            // Reset logic for new day
            if (prev.lastJournalDate !== today) {
                dailyActions = 0;

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (prev.lastJournalDate === yesterday.toDateString()) {
                    newStreak += 1;
                } else if (prev.lastJournalDate !== today) {
                    newStreak = 1;
                }
            } else if (newStreak === 0) {
                newStreak = 1;
            }

            dailyActions += 1;

            return {
                ...prev,
                lastJournalDate: today,
                streak: newStreak,
                dreamsRecorded: prev.dreamsRecorded + 1,
                dailyActions
            };
        });
    };

    const completeMission = (category: 'morning' | 'day' | 'night', xpEarned: number) => {
        const today = new Date().toDateString();

        setStats(prev => {
            // Check if attempting to re-complete today
            if (prev.lastMissionDates?.[category] === today) return prev;

            return {
                ...prev,
                xp: prev.xp + xpEarned,
                dailyActions: prev.dailyActions + 1,
                lastMissionDates: {
                    ...(prev.lastMissionDates || { morning: null, day: null, night: null }),
                    [category]: today
                }
            };
        });
    };

    const toggleTask = (taskId: string, _xpReward: number) => {
        // Maintained for potential backward compatibility
        setStats(prev => {
            const isCompleted = prev.completedTasks?.includes(taskId);
            let newCompleted = prev.completedTasks || [];
            if (isCompleted) {
                newCompleted = newCompleted.filter(id => id !== taskId);
            } else {
                newCompleted = [...newCompleted, taskId];
            }
            return { ...prev, completedTasks: newCompleted };
        });
    };

    const addDream = (dreamData: Omit<Dream, 'id' | 'date'>) => {
        const newDream: Dream = {
            ...dreamData,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };

        setDreams(prev => [newDream, ...prev]);
        recordAction();

        let xpEarned = 10 + (dreamData.clarity * 2);
        if (dreamData.isLucid) xpEarned += 20;
        awardXP(xpEarned);
    };

    const deleteDream = async (id: string) => {
        setDreams(prev => prev.filter(d => d.id !== id));
        const { dreamService } = await import('../services/dreamService');
        await dreamService.deleteDream(id);
    };

    const updateBedtime = (time: string) => {
        setStats(prev => ({ ...prev, bedtime: time }));
    };

    const completeOnboarding = (_name: string, bedtime?: string) => {
        localStorage.setItem('dreamlab_onboarding_completed', 'true');
        setHasCompletedOnboarding(true);
        if (bedtime) updateBedtime(bedtime);
    };

    const syncDreams = async (userId: string) => {
        const { dreamService } = await import('../services/dreamService');
        const { data: nights } = await dreamService.getRecentNights(userId, 30);

        const { data: profile } = await authService.getProfile(userId);
        if (profile?.preferences) {
            const prefs = profile.preferences as any;
            if (prefs.bedtime || prefs.stats) {
                setStats(prev => ({
                    ...prev,
                    ...prefs.stats,
                    bedtime: prefs.bedtime || prev.bedtime
                }));
            }
        }

        if (nights) {
            const remoteDreams: Dream[] = nights.flatMap((night: any) =>
                (night.dreams || []).map((d: any) => ({
                    id: d.id,
                    date: night.date,
                    title: d.title || 'Sonho Sem Título',
                    description: d.raw_text || '',
                    clarity: d.recall_clarity || 50,
                    isLucid: d.lucid || false,
                    mood: d.emotion_main || 'neutral',
                    recordingUrl: d.voice_note_url,
                    coverImage: d.cover_image
                }))
            );

            if (remoteDreams.length > 0) {
                setDreams(remoteDreams);
            }
        }
    };

    return (
        <AppContext.Provider value={{
            dreams,
            stats,
            addDream,
            deleteDream,
            hasCompletedOnboarding,
            completeOnboarding,
            syncDreams,
            updateBedtime,
            toggleTask,
            completeMission,
            lucidProbability
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

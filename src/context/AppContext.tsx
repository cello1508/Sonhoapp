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
    markTaskAsCompleted: (taskId: string, xpReward: number) => void;
    lucidProbability: number;
    awardXP: (amount: number) => void;
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
        let prob = 10;
        prob += Math.min(stats.dailyActions * 2, 20);
        prob += Math.min(stats.streak * 3, 50);
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

    const completeMission = async (category: 'morning' | 'day' | 'night', xpEarned: number) => {
        const today = new Date().toDateString();

        // Optimistic UI update
        setStats(prev => {
            if (prev.lastMissionDates?.[category] === today) return prev;

            const newXP = prev.xp + xpEarned;
            const newLevel = Math.floor(newXP / 100) + 1;

            return {
                ...prev,
                xp: newXP,
                level: newLevel,
                dailyActions: prev.dailyActions + 1,
                lastMissionDates: {
                    ...(prev.lastMissionDates || { morning: null, day: null, night: null }),
                    [category]: today
                }
            };
        });

        // Persist to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { missionService } = await import('../services/missionService');
            await missionService.completeMission(user.id, category, xpEarned);

            // Also update legacy stats (XP, streaks) in preferences
            // Note: We need to use the NEW values here, so calculating again for persistence payload
            // or just letting the optimistic update sync on next load/action. 
            // Better to sync explicitly:
            // const newXP = stats.xp + xpEarned; // Use current stats ref which might be stale vs closure? 
            // Actually 'stats' in closure might be old.
            // Safer: We don't have the new stats object readily available in this async block without prev.
            // But updatePreferences merges. Simple fix:
            // Just sync whatever 'setStats' ends up with next render? No, side effects inside effect needed?
            // Force re-sync in useEffect[stats] handles this!
            // Wait, "authService.updateUserStats(user.id, stats)" inside completeMission uses STALE stats.

            // AppContext.tsx has a useEffect on [stats] that syncs to Supabase!
            // Line 66: useEffect(() => ... authService.updateUserStats ... )
            // So we DON'T need to manually call authService.updateUserStats here for the basic stats!
            // We ONLY need to call missionService.completeMission.

            // However, the user might close the app immediately. 
            // The useEffect will trigger on the state change.
            // So removing manual authService call is safer to avoid race conditions with stale state.
        }
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

    const markTaskAsCompleted = (taskId: string, _xpReward: number) => {
        setStats(prev => {
            const completed = prev.completedTasks || [];
            if (completed.includes(taskId)) return prev;
            return { ...prev, completedTasks: [...completed, taskId] };
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
        const { missionService } = await import('../services/missionService');

        // 1. Sync Dreams
        const { data: nights } = await dreamService.getRecentNights(userId, 30);

        // 2. Sync Profile/Stats
        const { data: profile } = await authService.getProfile(userId);

        // 3. Sync Today's Missions from dedicated table
        const todayISO = new Date().toISOString().split('T')[0];
        const { data: completedMissions } = await missionService.getMissionsByDate(userId, todayISO);

        let missionDates: UserStats['lastMissionDates'] = { morning: null, day: null, night: null };
        if (completedMissions) {
            const todayStr = new Date().toDateString(); // "Tue Dec 09 2025" used in UI logic
            completedMissions.forEach((m: any) => {
                if (m.category === 'morning' || m.category === 'day' || m.category === 'night') {
                    // Map ISO date back to DateString format used by UI for now, or just use todayStr since we queried today
                    if (missionDates) missionDates[m.category as 'morning' | 'day' | 'night'] = todayStr;
                }
            });
        }

        if (profile?.preferences) {
            const prefs = profile.preferences as any;
            if (prefs.bedtime || prefs.stats) {
                setStats(prev => ({
                    ...prev,
                    ...prefs.stats, // Legacy stats (XP, Streak)
                    lastMissionDates: missionDates, // Override with source of truth from table
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
            markTaskAsCompleted,
            hasCompletedOnboarding,
            completeOnboarding,
            syncDreams,
            updateBedtime,
            toggleTask,
            completeMission,
            lucidProbability,
            awardXP
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

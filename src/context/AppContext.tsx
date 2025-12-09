import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Dream, UserStats } from '../types';

const DREAMS_KEY = 'dreamlab_dreams';
const STATS_KEY = 'dreamlab_stats';

const DEFAULT_STATS: UserStats = {
    xp: 0,
    level: 1,
    streak: 0,
    lastJournalDate: null,
    dreamsRecorded: 0
};

interface AppContextType {
    dreams: Dream[];
    stats: UserStats;
    addDream: (dream: Omit<Dream, 'id' | 'date'>) => void;
    deleteDream: (id: string) => void;
    hasCompletedOnboarding: boolean;
    completeOnboarding: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [dreams, setDreams] = useState<Dream[]>(() => {
        const saved = localStorage.getItem(DREAMS_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [stats, setStats] = useState<UserStats>(() => {
        const saved = localStorage.getItem(STATS_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_STATS;
    });

    useEffect(() => {
        localStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    }, [dreams]);

    useEffect(() => {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }, [stats]);

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
            if (prev.lastJournalDate !== today) {
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

            return {
                ...prev,
                lastJournalDate: today,
                streak: newStreak,
                dreamsRecorded: prev.dreamsRecorded + 1
            };
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

        // XP Logic: 10 base + 5 for clarity + 20 if lucid
        let xpEarned = 10 + (dreamData.clarity * 2);
        if (dreamData.isLucid) xpEarned += 20;
        awardXP(xpEarned);
    };

    const deleteDream = (id: string) => {
        setDreams(prev => prev.filter(d => d.id !== id));
    };

    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
        return localStorage.getItem('dreamlab_onboarding_completed') === 'true';
    });

    const completeOnboarding = (name: string) => {
        localStorage.setItem('dreamlab_onboarding_completed', 'true');
        // Save name to localStorage or stats in future
        console.log('User completed onboarding:', name);
        setHasCompletedOnboarding(true);
    };

    return (
        <AppContext.Provider value={{ dreams, stats, addDream, deleteDream, hasCompletedOnboarding, completeOnboarding }}>
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

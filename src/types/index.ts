export interface Dream {
    id: string;
    date: string; // ISO date string
    title: string;
    description: string;
    clarity: number; // 1-5
    isLucid: boolean;
    tags: string[];
    coverImage?: string;
}

export interface UserStats {
    xp: number;
    level: number;
    streak: number;
    lastJournalDate: string | null;
    dreamsRecorded: number;
    dailyActions: number; // Number of actions taken today
    bedtime?: string; // HH:mm format
}

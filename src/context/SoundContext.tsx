import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { soundService } from '../services/soundService';
import { useApp } from './AppContext';

interface SoundContextType {
    isActive: boolean;
    isMinimized: boolean;
    timeLeft: number;
    startSession: () => void;
    stopSession: (fadeDuration?: number) => void;
    minimizeSession: () => void;
    maximizeSession: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
    const { awardXP } = useApp();
    const [isActive, setIsActive] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes default

    // Timer Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Finished Successfully
                        awardXP(50); // Reward for 3-min session

                        // Slow fade for timer end
                        stopSession(3.0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Redundant check, but safe
            stopSession(3.0);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, awardXP]);

    const startSession = () => {
        setIsActive(true);
        setIsMinimized(false); // Open full modal initially
        setTimeLeft(180);
        soundService.setMute(false); // Unmute/Start
    };

    const stopSession = (fadeDuration?: number) => {
        // Protect against Event objects from onClick being passed as fadeDuration
        const duration = typeof fadeDuration === 'number' ? fadeDuration : 0.1;

        setIsActive(false);
        setIsMinimized(false);
        setTimeLeft(180);
        soundService.setMute(true, duration);
    };

    const minimizeSession = () => setIsMinimized(true);
    const maximizeSession = () => setIsMinimized(false);

    return (
        <SoundContext.Provider value={{ isActive, isMinimized, timeLeft, startSession, stopSession, minimizeSession, maximizeSession }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}

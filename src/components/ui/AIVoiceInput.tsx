"use client";

import { Mic, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface AIVoiceInputProps {
    onStart?: () => void;
    onStop?: (duration: number) => void;
    visualizerBars?: number;
    demoMode?: boolean;
    demoInterval?: number;
    className?: string;
}

export function AIVoiceInput({
    onStart,
    onStop,
    visualizerBars = 48,
    demoMode = false,
    demoInterval = 3000,
    className
}: AIVoiceInputProps) {
    const [submitted, setSubmitted] = useState(false);
    const [time, setTime] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [isDemo, setIsDemo] = useState(demoMode);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        if (submitted) {
            onStart?.();
            intervalId = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        } else {
            if (time > 0) {
                onStop?.(time);
                setTime(0);
            }
        }

        return () => clearInterval(intervalId);
    }, [submitted, time, onStart, onStop]);

    useEffect(() => {
        if (!isDemo) return;

        let timeoutId: ReturnType<typeof setTimeout>;
        const runAnimation = () => {
            setSubmitted(true);
            timeoutId = setTimeout(() => {
                setSubmitted(false);
                timeoutId = setTimeout(runAnimation, 1000);
            }, demoInterval);
        };

        const initialTimeout = setTimeout(runAnimation, 100);
        return () => {
            clearTimeout(timeoutId);
            clearTimeout(initialTimeout);
        };
    }, [isDemo, demoInterval]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleClick = () => {
        if (isDemo) {
            setIsDemo(false);
            setSubmitted(false);
        } else {
            setSubmitted((prev) => !prev);
        }
    };

    return (
        <div className={cn("w-full py-6 px-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm", className)}>
            <div className="relative w-full mx-auto flex items-center flex-col gap-4">
                <button
                    className={cn(
                        "group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                        submitted
                            ? "bg-red-500/20 shadow-red-500/20 scale-110"
                            : "bg-dream-500/20 hover:bg-dream-500/30 text-dream-400 hover:text-white shadow-dream-500/20"
                    )}
                    type="button"
                    onClick={handleClick}
                >
                    {submitted ? (
                        <Square className="w-8 h-8 text-red-500 fill-current animate-pulse" />
                    ) : (
                        <Mic className="w-8 h-8" />
                    )}
                </button>

                <span
                    className={cn(
                        "font-mono text-xl font-bold transition-opacity duration-300",
                        submitted
                            ? "text-red-400"
                            : "text-slate-500"
                    )}
                >
                    {formatTime(time)}
                </span>

                <div className="h-12 w-full max-w-[200px] flex items-center justify-center gap-1">
                    {[...Array(visualizerBars)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1 rounded-full transition-all duration-75",
                                submitted
                                    ? "bg-gradient-to-t from-dream-500 to-purple-500"
                                    : "bg-slate-800 h-1"
                            )}
                            style={
                                submitted && isClient
                                    ? {
                                        height: `${Math.max(10, Math.random() * 100)}%`,
                                        opacity: Math.random() * 0.5 + 0.5
                                    }
                                    : undefined
                            }
                        />
                    ))}
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {submitted ? "Gravando Sonho..." : "Toque para Gravar"}
                </p>
            </div>
        </div>
    );
}

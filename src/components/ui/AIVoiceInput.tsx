"use client";

import { Mic, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface AIVoiceInputProps {
    onStart?: () => void;
    onStop?: (duration: number, blob?: Blob) => void;
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

    // MediaRecorder State
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    // const [audioChunks, setAudioChunks] = useState<Blob[]>([]); // Using local var in closure for now

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }
        };
    }, [mediaRecorder]);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        if (submitted) {
            onStart?.();
            intervalId = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        } else {
            if (time > 0) {
                // Formatting handled by user of component typically, but we pass duration.
                // The actual blob is passed via stopRecording logic.
                // onStop?.(time); // Moved to stopRecording
                setTime(0);
            }
        }

        return () => clearInterval(intervalId);
    }, [submitted, time, onStart]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                // setAudioChunks([]); // Clear for next time

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                onStop?.(time, blob); // Updated signature
            };

            recorder.start();
            setMediaRecorder(recorder);
            // setAudioChunks([]);
            setSubmitted(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Não foi possível acessar o microfone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            setSubmitted(false);
        } else {
            // Demo mode fallback
            setSubmitted(false);
            onStop?.(time, new Blob());
        }
    };

    const handleClick = () => {
        if (isDemo) {
            setIsDemo(false);
            setSubmitted(false);
        } else {
            if (submitted) {
                stopRecording();
            } else {
                startRecording();
            }
        }
    };

    // ... (Visualizer logic remains same for now, or could use AudioContext for real vis)
    // Keeping random visualizer for simplicity/performance in MVP.

    // ... (useEffect for demo animation remains)
    useEffect(() => {
        if (!isDemo) return;
        // ... (demo logic)
    }, [isDemo, demoInterval]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
                    {submitted ? "Gravando..." : "Toque para Gravar"}
                </p>
            </div>
        </div>
    );
}

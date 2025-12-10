"use client";

import { Mic, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

// Add global types for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface AIVoiceInputProps {
    onStart?: () => void;
    onStop?: (duration: number, blob?: Blob, transcript?: string) => void;
    onTranscriptChange?: (text: string) => void;
    visualizerBars?: number;
    demoMode?: boolean;
    demoInterval?: number;
    className?: string;
}

export function AIVoiceInput({
    onStart,
    onStop,
    onTranscriptChange,
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

    // Speech Recognition Hook
    const {
        startListening,
        stopListening,
        transcript
    } = useSpeechRecognition();

    // Ref to hold the latest transcript for the mediaRecorder closure
    const transcriptRef = useRef("");

    // Sync ref when transcript updates
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Effect to notify parent of transcript changes in real-time
    useEffect(() => {
        if (transcript && submitted) {
            onTranscriptChange?.(transcript);
        }
    }, [transcript, onTranscriptChange, submitted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }
            stopListening();
        };
    }, [mediaRecorder, stopListening]);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        if (submitted) {
            onStart?.();
            intervalId = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        } else {
            if (time > 0) {
                setTime(0);
            }
        }

        return () => clearInterval(intervalId);
    }, [submitted, time, onStart]);

    const startRecording = async () => {
        try {
            // Ref will auto-sync with hook transcript being empty or new
            transcriptRef.current = "";

            // 1. Audio Recording
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
                stream.getTracks().forEach(track => track.stop());

                // Pass the accumulated transcript from REF (latest value)
                onStop?.(time, blob, transcriptRef.current);
            };

            recorder.start();
            setMediaRecorder(recorder);

            // 2. Start Speech Recognition via Hook
            startListening();

            setSubmitted(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Não foi possível acessar o microfone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        stopListening();
        setSubmitted(false);

        // Demo mode logic is separate, focusing on real implementation here
        if (!mediaRecorder && isDemo) { // Fallback for pure demo UI testing
            onStop?.(time, new Blob(), "Texto simulado do modo demo...");
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

    // ... (Visualizer logic remains)
    // ...

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

                {/* Visualizer bars */}
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
                    {submitted ? "Gravando e Ouvindo..." : "Toque para Gravar"}
                </p>

                {/* Live Transcript Preview */}
                {submitted && transcript && (
                    <p className="text-xs text-slate-400 max-w-xs text-center line-clamp-2 animate-pulse">
                        "{transcript.trim()}"
                    </p>
                )}
            </div>
        </div>
    );
}

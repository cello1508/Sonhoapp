import { useState, useEffect, useMemo, useRef } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Mic, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundService } from '../../services/soundService';
import { isSimilar } from '../../lib/stringUtils';

interface VoicePracticeChallengeProps {
    targetPhrase: string;
    requiredRepetitions: number;
    onComplete: () => void;
}

export function VoicePracticeChallenge({ targetPhrase, requiredRepetitions, onComplete }: VoicePracticeChallengeProps) {
    const [repetitions, setRepetitions] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastMatchTime, setLastMatchTime] = useState(0);

    const hasCompletedRef = useRef(false);

    // ... imports/setup ...

    const handleMatch = () => {
        if (hasCompletedRef.current) return;

        setLastMatchTime(Date.now());
        soundService.playPing();

        // CRITICAL: Stop listening to clear the Web Speech API buffer.
        stopListening(true);
        resetTranscript();

        setRepetitions(prev => {
            if (hasCompletedRef.current) return prev; // Safety check

            const next = prev + 1;

            if (next >= requiredRepetitions) {
                hasCompletedRef.current = true; // Mark as done immediately to prevent re-entry
                setShowSuccess(true);
                soundService.playSuccess();
                setTimeout(() => {
                    onComplete();
                }, 2000);
            } else {
                // If not done, restart listening after a short pause
                setTimeout(() => {
                    startListening();
                }, 1000);
            }
            return next;
        });
    };

    const {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition({
        continuous: true,
        interimResults: true,
        lang: 'pt-BR'
    });

    // Normalize helper
    const normalize = (text: string) => {
        return text.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // remove punctuation
            .trim();
    };

    const targetWords = useMemo(() => normalize(targetPhrase).split(' '), [targetPhrase]);
    const transcriptWords = useMemo(() => normalize(transcript).split(' '), [transcript]);

    // Check for match
    useEffect(() => {
        if (!isListening) return;

        const normalizedTranscript = normalize(transcript);
        const normalizedTarget = normalize(targetPhrase);

        // Fuzzy Match Logic
        // We check if the normalized transcript *containing* the target is similar enough
        // Or if the transcript is simply long enough and "close" to target.
        const isMatch = isSimilar(normalizedTranscript, normalizedTarget, 0.85) || normalizedTranscript.includes(normalizedTarget);

        if (isMatch) {
            // Avoid double counting very fast
            const now = Date.now();
            // Debounce matches (e.g., must be 2 seconds apart)
            if (now - lastMatchTime > 2000) {
                handleMatch();
                // Reset transcript immediately for next rep? 
                // Wait a tiny bit so user sees it green
                setTimeout(() => resetTranscript(), 500);
                // This setTimeout is now handled within handleMatch
            }
        }
    }, [transcript, targetPhrase, isListening, lastMatchTime, resetTranscript]);



    return (
        <div className="w-full flex flex-col items-center space-y-8 py-4">

            {/* Progress */}
            <div className="flex items-center space-x-2 text-slate-400">
                <RotateCcw size={16} />
                <span className="font-bold uppercase tracking-wider text-sm">Repetições: {repetitions} / {requiredRepetitions}</span>
            </div>

            {/* Target Phrase area */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {targetWords.map((word, i) => {
                    // Check if this specific word index is "matched" based on transcript length
                    // This is tricky with continuous speech. 
                    // A simple approximation: if transcript has N words, highlight first N words.
                    // But if we reset, this resets.
                    // Let's just highlight specific words if they appear in transcript? 
                    // No, order matters.
                    // Let's just check if the current transcript starts with these words.

                    const isMatched = i < transcriptWords.length && transcriptWords[i] === word;

                    // Or if we are in "Success" state for this repetition (debounce time)
                    // we show full green.
                    const isJustMatched = (Date.now() - lastMatchTime < 1500);

                    return (
                        <motion.span
                            key={i}
                            animate={{
                                color: (isMatched || isJustMatched) ? '#4ade80' : '#94a3b8',
                                scale: (isMatched || isJustMatched) ? 1.05 : 1
                            }}
                            className="text-2xl font-bold transition-colors duration-200"
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </div>

            {/* Mic Control */}
            <div className="relative">
                <button
                    onClick={() => isListening ? stopListening(true) : startListening()}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isListening
                        ? 'bg-red-500/20 text-red-400 ring-4 ring-red-500/20 animate-pulse'
                        : 'bg-dream-500 text-white shadow-dream-500/50 hover:scale-105'
                        }`}
                >
                    {isListening ? <Mic size={40} /> : <Mic size={40} />}
                </button>

                {/* Visualizer Ring (Fake for now, or could use AudioContext if we linked it up differently) */}
                {isListening && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping" />
                )}
            </div>

            <p className="text-slate-500 text-sm">
                {isListening ? error ? "Erro no microfone" : "Ouvindo..." : "Toque para falar"}
            </p>

            {/* Debug Transcript (Optional, maybe remove for prod) */}
            {isListening && transcript && (
                <p className="text-xs text-slate-600 max-w-xs text-center opacity-50">
                    "{transcript}"
                </p>
            )}

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10"
                    >
                        <div className="flex flex-col items-center">
                            <CheckCircle2 size={64} className="text-green-500 mb-4" />
                            <h3 className="text-2xl font-bold text-white">Excelente!</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

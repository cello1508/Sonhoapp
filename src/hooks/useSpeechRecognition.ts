import { useState, useEffect, useRef, useCallback } from 'react';

// Global types for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface UseSpeechRecognitionProps {
    onResult?: (transcript: string) => void;
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
}

export function useSpeechRecognition({
    onResult,
    continuous = true,
    interimResults = true,
    lang = 'pt-BR'
}: UseSpeechRecognitionProps = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Refs to keep track of instances without triggering re-renders
    const recognitionRef = useRef<any | null>(null);
    const onResultRef = useRef(onResult);

    // Update ref when callback changes
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    const startListening = useCallback(() => {
        setError(null);
        setTranscript('');

        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech Recognition API not supported in this browser.');
            return;
        }

        // Initialize if not already done (or simple recreation)
        // We recreate to ensure fresh state
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // For continuous recognition, we might want the full session transcript
            // But usually 'event.results' accumulates. 
            // Let's grab the full text currently available in the buffer.
            const currentFullTranscript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('');

            setTranscript(currentFullTranscript);
            onResultRef.current?.(currentFullTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setError(event.error);
            setIsListening(false);
        };

        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        try {
            recognition.start();
            recognitionRef.current = recognition;
        } catch (err) {
            console.error("Error starting recognition:", err);
            setError('Failed to start recording.');
        }
    }, [continuous, interimResults, lang]);

    const stopListening = useCallback((force: boolean = false) => {
        if (recognitionRef.current) {
            if (force) {
                // Hard reset for Voice Practice (clears buffer instantly)
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.abort();
                recognitionRef.current = null;
            } else {
                // Gentle stop for Dictation (processes last result)
                recognitionRef.current.stop();
                // We typically don't nullify here so onend can fire and cleanup normally,
                // but we also set isListening(false) below just in case.

                // CRITICAL: For standard usage, we want to keep the ref valid until onend?
                // Actually, if we just call stop(), the instance is still 'alive' until onend.
                // But we can reset the ref if we want to force a new instance next time.
                // Let's rely on onend to finalize state. 
                // But to be safe against zombies, maybe we leave the ref alone?
                // The issue is: if we start again, we check if ref exists and abort it.
            }
        }
        // If forcing, we update state immediately.
        // If stopping normally, usually onend handles it, but manual update doesn't hurt.
        if (force) {
            setIsListening(false);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript
    };
}

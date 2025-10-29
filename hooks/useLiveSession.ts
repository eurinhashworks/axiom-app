import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';

// Audio encoding function as per guidelines
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const useLiveSession = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    // Using a ref for transcription to avoid stale closures in event handlers
    const fullTranscriptionRef = useRef('');

    const stopSession = useCallback(() => {
        if (!isSessionActive && !sessionPromiseRef.current && !mediaStreamRef.current) return;
        
        setIsSessionActive(false);

        // Stop microphone
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Stop audio processing
        if (sourceNodeRef.current && scriptProcessorRef.current) {
            sourceNodeRef.current.disconnect(scriptProcessorRef.current);
        }
        if (scriptProcessorRef.current && audioContextRef.current) {
            scriptProcessorRef.current.disconnect(audioContextRef.current.destination);
            scriptProcessorRef.current.onaudioprocess = null;
        }
        scriptProcessorRef.current = null;
        sourceNodeRef.current = null;

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Close Gemini session
        sessionPromiseRef.current?.then(session => {
            session.close();
        });
        sessionPromiseRef.current = null;

    }, [isSessionActive]);

    const startSession = async () => {
        if (isSessionActive) return;

        setError(null);
        setTranscription('');
        fullTranscriptionRef.current = '';
        setIsSessionActive(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // Initialize the Google Gemini API client
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Live session opened.');
                        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                        sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            // CRITICAL: Use promise to avoid race condition and stale closures
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        sourceNodeRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            const { text, isFinal } = message.serverContent.inputTranscription;
                            if (isFinal) {
                                fullTranscriptionRef.current += text + ' ';
                                setTranscription(fullTranscriptionRef.current);
                            } else {
                                // Show intermediate results for better UX
                                setTranscription(fullTranscriptionRef.current + text);
                            }
                        }
                        
                        // Per guidelines, must handle audio output even if not used. We just won't play it.
                        const base64EncodedAudioString =
                          message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64EncodedAudioString) {
                            // Audio data received, but we don't need to play it for this use case.
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('An error occurred during the live session.');
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Live session closed.');
                        stopSession();
                    },
                },
                config: {
                    inputAudioTranscription: {},
                    // Per guidelines, this must be present.
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: 'You are a business idea brainstorming assistant. Your primary function is to accurately transcribe the user\'s thoughts. Only respond with audio if absolutely necessary, for example to confirm you are listening if there is a long pause.',
                },
            });

        } catch (err) {
            console.error('Failed to start session:', err);
            setError('Could not access microphone. Please check your permissions.');
            setIsSessionActive(false);
        }
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopSession();
        };
    }, [stopSession]);

    return { isSessionActive, transcription, error, startSession, stopSession };
};

export default useLiveSession;

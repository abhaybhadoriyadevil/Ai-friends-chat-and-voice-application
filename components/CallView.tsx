
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { AgentProfile, Transcript } from '../types';
import { generateSystemPrompt } from '../services/promptService';
import { encode, decode, decodeAudioData } from '../services/audioService';
import { EMOTION_AVATAR_MAP } from '../constants';
import { PhoneIcon } from './icons/PhoneIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface CallViewProps {
    agent: AgentProfile;
    onEndCall: () => void;
}

const FRAME_RATE = 2; // Send 2 frames per second
const JPEG_QUALITY = 0.7;

const CallView: React.FC<CallViewProps> = ({ agent, onEndCall }) => {
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [connectionState, setConnectionState] = useState<'Connecting' | 'Connected' | 'Error' | 'Ended'>('Connecting');
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const userVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const frameIntervalRef = useRef<number | null>(null);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const inputAudioContextRef = useRef<AudioContext>();
    const outputAudioContextRef = useRef<AudioContext>();
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const startSession = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            mediaStreamRef.current = stream;
            if (userVideoRef.current) {
                userVideoRef.current.srcObject = stream;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = generateSystemPrompt(agent, []);

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const outputNode = outputAudioContextRef.current.createGain();
            outputNode.connect(outputAudioContextRef.current.destination);

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.voiceName || 'Zephyr' } },
                    },
                    systemInstruction: systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setConnectionState('Connected');
                        
                        const inputAudioContext = inputAudioContextRef.current!;
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        audioSourceRef.current = source;
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        audioProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);

                        if (userVideoRef.current && canvasRef.current) {
                            const videoEl = userVideoRef.current;
                            const canvasEl = canvasRef.current;
                            const ctx = canvasEl.getContext('2d');
                            if (ctx) {
                                frameIntervalRef.current = window.setInterval(() => {
                                    if (videoEl.readyState < 2) return;
                                    canvasEl.width = videoEl.videoWidth;
                                    canvasEl.height = videoEl.videoHeight;
                                    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                                    canvasEl.toBlob(
                                        async (blob) => {
                                            if (blob) {
                                                const base64Data = await blobToBase64(blob);
                                                sessionPromiseRef.current?.then((session) => {
                                                    session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                                                });
                                            }
                                        },
                                        'image/jpeg',
                                        JPEG_QUALITY
                                    );
                                }, 1000 / FRAME_RATE);
                            }
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        } else if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscriptionRef.current;
                            const fullOutput = currentOutputTranscriptionRef.current;
                            setTranscripts(prev => [
                                ...prev,
                                { author: 'You', text: fullInput },
                                { author: 'Agent', text: fullOutput }
                            ].filter(t => t.text.trim() !== ''));
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            const outputAudioContext = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            
                            source.addEventListener('ended', () => { audioSourcesRef.current.delete(source); });
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                         
                        if (message.serverContent?.interrupted) {
                           for (const source of audioSourcesRef.current.values()) {
                               source.stop();
                           }
                           audioSourcesRef.current.clear();
                           nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Session error:", e);
                        setConnectionState('Error');
                    },
                    onclose: () => {
                        setConnectionState('Ended');
                    },
                }
            });
        } catch (error) {
            console.error("Failed to start session:", error);
            setConnectionState('Error');
        }
    }, [agent]);
    
    const cleanup = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        
        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        audioProcessorRef.current?.disconnect();
        audioSourceRef.current?.disconnect();
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
    }, []);

    const handleHangUp = () => {
        cleanup();
        onEndCall();
    };

    useEffect(() => {
        startSession();
        return cleanup;
    }, [startSession, cleanup]);

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-900 text-gray-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 p-4 z-30">
                <button 
                    onClick={handleHangUp} 
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-black/20 p-2 rounded-lg"
                >
                    <ChevronLeftIcon />
                    <span>Back to Chat</span>
                </button>
            </div>

            <video ref={userVideoRef} autoPlay muted playsInline className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg shadow-xl object-cover z-20"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>

            <div className="flex-grow flex flex-col items-center justify-center p-4 pt-12">
                <div className="text-center">
                    <div className="relative inline-block">
                         <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-6xl mb-4 border-4 border-gray-600 overflow-hidden">
                           {agent.avatarUrl ? (
                                <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                           ) : (
                                <span>{EMOTION_AVATAR_MAP[agent.emotion]}</span>
                           )}
                         </div>
                         <span className={`absolute bottom-3 right-0 block h-6 w-6 rounded-full ${connectionState === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'} border-4 border-gray-900`}></span>
                    </div>
                   
                    <h1 className="text-4xl font-bold">{agent.name}</h1>
                    <p className="text-lg text-gray-400">{agent.profession}</p>
                    <p className="mt-2 text-indigo-400 font-medium h-6">{connectionState !== 'Connected' ? `${connectionState}...` : ''}</p>
                </div>
                
                <div className="w-full max-w-3xl flex-grow mt-4 overflow-y-auto p-4 bg-black/20 rounded-lg flex flex-col-reverse">
                    <div className="space-y-4">
                        {transcripts.slice().reverse().map((t, i) => (
                             <div key={i} className={`flex ${t.author === 'You' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`p-3 rounded-lg max-w-lg ${t.author === 'You' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                     <p className="font-bold text-sm mb-1">{t.author}</p>
                                     <p className="whitespace-pre-wrap">{t.text}</p>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-4 flex justify-center items-center shrink-0">
                <button 
                    onClick={handleHangUp}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors"
                    title="End Call"
                >
                    <PhoneIcon className="rotate-[135deg]" />
                </button>
            </div>
        </div>
    );
};

export default CallView;
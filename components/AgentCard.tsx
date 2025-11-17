
import React, { useState, useEffect, useRef } from 'react';
import { AgentProfile, Emotion, Gender, Profession, PersonalityTrait, SpeakingStyle, VoiceType } from '../types';
import { PROFESSION_ICON_MAP, PREBUILT_VOICES, PrebuiltVoice, SPEAKING_STYLES } from '../constants';
import { generateSpeechPreview } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioService';
import { TrashIcon } from './icons/TrashIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { PlayIcon } from './icons/PlayIcon';

interface AgentCardProps {
    agent: AgentProfile;
    onUpdateAgent: (agent: AgentProfile) => void;
    onRemoveAgent: (agentId: string) => void;
    onStartCall: (agentId: string) => void;
    professions: Profession[];
    emotions: Emotion[];
    genders: Gender[];
    personalityTraits: PersonalityTrait[];
    canRemove: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onUpdateAgent, onRemoveAgent, onStartCall, professions, emotions, genders, personalityTraits, canRemove }) => {
    const [localAgent, setLocalAgent] = useState(agent);
    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const voiceFileInputRef = useRef<HTMLInputElement>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        setLocalAgent(agent);
    }, [agent]);
    
    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        return () => {
            audioContextRef.current?.close().catch(console.error);
            audioContextRef.current = null;
        }
    }, []);

    const handleFieldChange = (field: keyof AgentProfile, value: any) => {
        const updatedValue = field === 'age' ? parseInt(value, 10) || 0 : value;
        const updatedAgent = { ...localAgent, [field]: updatedValue };
        setLocalAgent(updatedAgent);
        onUpdateAgent(updatedAgent);
    };

    const handleTraitChange = (trait: PersonalityTrait, isChecked: boolean) => {
        const currentTraits = localAgent.personalityTraits || [];
        const newTraits = isChecked
            ? [...currentTraits, trait]
            : currentTraits.filter(t => t !== trait);

        handleFieldChange('personalityTraits', newTraits);
    };
    
    const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                handleFieldChange('avatarUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleVoiceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                handleFieldChange('customVoiceUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handlePreviewVoice = async () => {
        if (isPreviewing || !localAgent.voiceName) return;
        
        setIsPreviewing(true);
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'suspended') {
                 audioContextRef.current?.resume();
            }
            if (!audioContextRef.current) throw new Error("Audio context not available.");

            const audioData = await generateSpeechPreview(
                `Hello, my name is ${localAgent.name}. This is a preview of my voice.`, 
                localAgent.voiceName as PrebuiltVoice,
                localAgent.speakingStyle || SpeakingStyle.Expressive
            );
            const decodedData = decode(audioData);
            const audioBuffer = await decodeAudioData(decodedData, audioContextRef.current, 24000, 1);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
        } catch (error) {
            console.error("Failed to preview voice:", error);
            alert("Could not play voice preview. Please check the console for errors.");
        } finally {
            setIsPreviewing(false);
        }
    };

    return (
        <div className="bg-gray-700/50 p-4 rounded-xl shadow-lg border border-gray-600/50">
            <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden mb-3 border-2 border-gray-500 shadow-lg">
                    {localAgent.avatarUrl ? (
                        <img src={localAgent.avatarUrl} alt={localAgent.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{PROFESSION_ICON_MAP[localAgent.profession]}</span>
                    )}
                </div>
                <input
                    type="text"
                    value={localAgent.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="bg-transparent text-2xl font-bold text-white border-none focus:ring-0 p-1 text-center w-full"
                />
                <div className="flex items-center mt-2 space-x-2">
                    <button onClick={() => onStartCall(agent.id)} title={`Start voice call with ${agent.name}`} className="text-gray-300 hover:text-green-400 transition-colors p-2 bg-gray-600/50 hover:bg-gray-600 rounded-full">
                        <PhoneIcon />
                    </button>
                    {canRemove && (
                        <button onClick={() => onRemoveAgent(agent.id)} title={`Remove ${agent.name}`} className="text-gray-300 hover:text-red-500 transition-colors p-2 bg-gray-600/50 hover:bg-gray-600 rounded-full">
                            <TrashIcon />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                 <div>
                     <label className="text-sm font-medium text-gray-400 mb-1">Avatar</label>
                     <input
                        type="file"
                        ref={avatarFileInputRef}
                        onChange={handleAvatarFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                     <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                            type="text"
                            value={localAgent.avatarUrl || ''}
                            onChange={(e) => handleFieldChange('avatarUrl', e.target.value)}
                            placeholder="Paste URL or upload"
                            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        />
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <button type="button" onClick={() => avatarFileInputRef.current?.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors whitespace-nowrap w-full sm:w-auto">Upload</button>
                            {localAgent.avatarUrl && (
                                <button type="button" onClick={() => handleFieldChange('avatarUrl', '')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors whitespace-nowrap w-full sm:w-auto">Remove</button>
                            )}
                        </div>
                     </div>
                </div>
            
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-600/50">
                     <div className="col-span-1 sm:col-span-2">
                        <label className="text-sm font-medium text-gray-400 mb-1 block">Voice Output (What you will hear)</label>
                        <div className="flex items-center gap-2">
                             <select
                                value={localAgent.voiceName || 'Zephyr'}
                                onChange={(e) => handleFieldChange('voiceName', e.target.value)}
                                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            >
                                {PREBUILT_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <button 
                                type="button" 
                                onClick={handlePreviewVoice} 
                                disabled={isPreviewing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg text-sm transition-colors whitespace-nowrap disabled:bg-gray-500 disabled:cursor-wait"
                                title="Preview Voice"
                            >
                                <PlayIcon />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This pre-built voice will be used for all audio previews and calls.</p>
                    </div>
    
                    <div className="col-span-1 sm:col-span-2 mt-2">
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Vocal Persona (How the AI will write)</label>
                        
                        <div role="radiogroup" className="flex items-center gap-4 mb-3">
                            <label className="flex items-center space-x-2 text-sm text-gray-200 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`voiceType-${agent.id}`}
                                    value={VoiceType.Prebuilt}
                                    checked={(localAgent.voiceType || VoiceType.Prebuilt) === VoiceType.Prebuilt}
                                    onChange={() => handleFieldChange('voiceType', VoiceType.Prebuilt)}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500"
                                />
                                <span>Match Pre-built Voice</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm text-gray-200 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`voiceType-${agent.id}`}
                                    value={VoiceType.Custom}
                                    checked={localAgent.voiceType === VoiceType.Custom}
                                    onChange={() => handleFieldChange('voiceType', VoiceType.Custom)}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500"
                                />
                                <span>From Custom Audio</span>
                            </label>
                        </div>
    
                        {(localAgent.voiceType === VoiceType.Custom) && (
                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600/50">
                                <input
                                    type="file"
                                    ref={voiceFileInputRef}
                                    onChange={handleVoiceFileChange}
                                    className="hidden"
                                    accept="audio/*"
                                />
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <div className="flex-grow bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-2.5 overflow-hidden whitespace-nowrap overflow-ellipsis w-full">
                                        {localAgent.customVoiceUrl ? 'Custom voice file uploaded' : 'No custom voice file'}
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                        <button type="button" onClick={() => voiceFileInputRef.current?.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors whitespace-nowrap w-full sm:w-auto">Upload Audio</button>
                                        {localAgent.customVoiceUrl && (
                                            <button type="button" onClick={() => handleFieldChange('customVoiceUrl', '')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors whitespace-nowrap w-full sm:w-auto">Remove</button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Note: This audio influences the AI's personality and text style only. The voice you hear is selected under "Voice Output" above.</p>
                            </div>
                        )}
    
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-400 mb-1">Speaking Style</label>
                            <select
                                value={localAgent.speakingStyle || SpeakingStyle.Expressive}
                                onChange={(e) => handleFieldChange('speakingStyle', e.target.value)}
                                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            >
                                {SPEAKING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
    
                    <div className="flex flex-col col-span-1 sm:col-span-2 mt-4">
                        <label className="text-sm font-medium text-gray-400 mb-1">Profession</label>
                        <select
                            value={localAgent.profession}
                            onChange={(e) => handleFieldChange('profession', e.target.value)}
                            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                            size={5}
                        >
                            {professions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col col-span-1 sm:col-span-2">
                        <label className="text-sm font-medium text-gray-400 mb-1">Emotion</label>
                        <select
                            value={localAgent.emotion}
                            onChange={(e) => handleFieldChange('emotion', e.target.value)}
                            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                            size={5}
                        >
                            {emotions.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                     <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-1">Age</label>
                        <input
                            type="number"
                            value={localAgent.age}
                            onChange={(e) => handleFieldChange('age', e.target.value)}
                            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            min="0"
                            max="150"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-1">Gender</label>
                        <select
                            value={localAgent.gender}
                            onChange={(e) => handleFieldChange('gender', e.target.value)}
                            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        >
                            {genders.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-600/50">
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Personality Traits</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                        {personalityTraits.map(trait => (
                            <label key={trait} className="flex items-center space-x-2 text-sm text-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localAgent.personalityTraits?.includes(trait) || false}
                                    onChange={e => handleTraitChange(trait, e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-500 rounded focus:ring-indigo-500"
                                />
                                <span>{trait}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentCard;

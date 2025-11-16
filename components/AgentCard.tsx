import React, { useState, useEffect, useRef } from 'react';
import { AgentProfile, Emotion, Gender, Profession, PersonalityTrait, SpeakingStyle } from '../types';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        setLocalAgent(agent);
    }, [agent]);
    
    useEffect(() => {
        // Initialize AudioContext on user interaction (e.g., component mount)
        // This is necessary because of browser autoplay policies
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        return () => {
            audioContextRef.current?.close().catch(console.error);
            audioContextRef.current = null;
        }
    }, []);

    const handleChange = (field: keyof Omit<AgentProfile, 'personalityTraits' | 'avatarUrl'>, value: string) => {
        const updatedAgent = {
            ...localAgent,
            [field]: field === 'age' ? parseInt(value, 10) || 0 : value
        };
        setLocalAgent(updatedAgent);
        onUpdateAgent(updatedAgent);
    };
    
    const handleAvatarChange = (value: string) => {
        const updatedAgent = { ...localAgent, avatarUrl: value };
        setLocalAgent(updatedAgent);
        onUpdateAgent(updatedAgent);
    };

    const handleTraitChange = (trait: PersonalityTrait, isChecked: boolean) => {
        const currentTraits = localAgent.personalityTraits || [];
        const newTraits = isChecked
            ? [...currentTraits, trait]
            : currentTraits.filter(t => t !== trait);

        const updatedAgent = { ...localAgent, personalityTraits: newTraits };
        setLocalAgent(updatedAgent);
        onUpdateAgent(updatedAgent);
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                handleAvatarChange(reader.result as string);
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
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 flex-grow mr-2">
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                        {localAgent.avatarUrl ? (
                            <img src={localAgent.avatarUrl} alt={localAgent.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{PROFESSION_ICON_MAP[localAgent.profession]}</span>
                        )}
                    </div>
                    <input
                        type="text"
                        value={localAgent.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="bg-transparent text-lg font-bold text-white border-none focus:ring-0 p-0 w-full"
                    />
                </div>
                <div className="flex items-center shrink-0">
                    <button onClick={() => onStartCall(agent.id)} title={`Start voice call with ${agent.name}`} className="text-gray-300 hover:text-green-400 transition-colors p-1 rounded-full">
                        <PhoneIcon />
                    </button>
                    {canRemove && (
                        <button onClick={() => onRemoveAgent(agent.id)} title={`Remove ${agent.name}`} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full">
                            <TrashIcon />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4">
                 <label className="text-sm font-medium text-gray-400 mb-1">Avatar</label>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                 <div className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        value={localAgent.avatarUrl || ''}
                        onChange={(e) => handleAvatarChange(e.target.value)}
                        placeholder="Paste URL or upload"
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors whitespace-nowrap">Upload</button>
                    {localAgent.avatarUrl && (
                        <button type="button" onClick={() => handleAvatarChange('')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors whitespace-nowrap">Remove</button>
                    )}
                 </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-400 mb-1">Profession</label>
                    <select
                        value={localAgent.profession}
                        onChange={(e) => handleChange('profession', e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                        size={5}
                    >
                        {professions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-400 mb-1">Emotion</label>
                    <select
                        value={localAgent.emotion}
                        onChange={(e) => handleChange('emotion', e.target.value)}
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
                        onChange={(e) => handleChange('age', e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        min="0"
                        max="150"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-400 mb-1">Gender</label>
                    <select
                        value={localAgent.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                        {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                 <div className="col-span-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-400 mb-1">Voice</label>
                    <div className="flex items-center gap-2">
                         <select
                            value={localAgent.voiceName || 'Zephyr'}
                            onChange={(e) => handleChange('voiceName', e.target.value)}
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
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-400 mb-1">Speaking Style</label>
                    <select
                        value={localAgent.speakingStyle || SpeakingStyle.Expressive}
                        onChange={(e) => handleChange('speakingStyle', e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                        {SPEAKING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600/50">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Personality Traits</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
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
    );
};

export default AgentCard;
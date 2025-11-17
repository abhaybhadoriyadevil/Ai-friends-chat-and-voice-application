import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AgentProfile, ChatMessage, Emotion, Gender, Profession, MessageAuthor, UserProfile, SpeakingStyle, VoiceType } from './types';
import { getParallelAgentResponses, initializeAi, clearAiInstance } from './services/geminiService';
import { AGENT_PROFILES } from './constants';
import ChatView from './components/ChatView';
import CallView from './components/CallView';
import ImagePreviewModal from './components/ImagePreviewModal';
import usePersistentState from './hooks/usePersistentState';

const App: React.FC = () => {
    // Persisted state
    const [agents, setAgents] = usePersistentState<AgentProfile[]>('ai-friends-agents', AGENT_PROFILES);
    const [messages, setMessages] = usePersistentState<ChatMessage[]>('ai-friends-messages', []);
    const [userProfile, setUserProfile] = usePersistentState<UserProfile>('ai-friends-user-profile', {
        name: 'You',
        bio: 'AI enthusiast exploring conversations with AI friends.',
        avatarUrl: '',
    });
    const [apiKey, setApiKey] = usePersistentState<string>('ai-friends-api-key', '');

    // Volatile state (not persisted)
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingMessage, setThinkingMessage] = useState('');
    const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [view, setView] = useState<'chat' | 'call'>('chat');
    const [agentInCall, setAgentInCall] = useState<AgentProfile | null>(null);
    const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
    
    useEffect(() => {
        // Only show welcome message if there's no chat history (i.e., first-ever session).
        if (messages.length === 0) {
            setMessages([{
                author: { id: 'system', name: 'System' },
                text: 'Welcome to the AI Agent Ensemble! Please add your Gemini API key in the settings (top-right gear icon) to begin.',
                timestamp: new Date().toISOString()
            }]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (apiKey) {
            initializeAi(apiKey);
        } else {
            clearAiInstance();
            console.warn("API Key is not set. AI features will not work.");
        }
    }, [apiKey]);

    const handleUpdateApiKey = (key: string) => {
        setApiKey(key);
    };
    
    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isThinking) return;

        const userAuthor: MessageAuthor = { id: 'user', name: userProfile.name, avatarUrl: userProfile.avatarUrl };
        const userMessage: ChatMessage = { author: userAuthor, text, timestamp: new Date().toISOString() };
        
        const currentMessageHistory = [...messages, userMessage];
        setMessages(currentMessageHistory);

        setIsThinking(true);
        setThinkingMessage('AI friends are thinking...');

        try {
            const agentResponses = await getParallelAgentResponses(agents, currentMessageHistory);

            if (agentResponses.length > 0) {
                // Wait for an initial "thinking" delay before the first response appears
                const initialDelay = Math.random() * 5000 + 2000; // 2-7 seconds
                await new Promise(res => setTimeout(res, initialDelay));
                
                const shuffledResponses = agentResponses.sort(() => Math.random() - 0.5);

                for (let i = 0; i < shuffledResponses.length; i++) {
                    const response = shuffledResponses[i];
                    const agent = agents.find(a => a.id === response.agentId);

                    if (agent) {
                        // Show "typing" indicator for this agent
                        setThinkingMessage(`${agent.name} is typing...`);

                        // Wait for a short "typing" delay to simulate human behavior
                        const typingDelay = Math.random() * 1500 + 500; // 0.5s to 2s
                        await new Promise(res => setTimeout(res, typingDelay));
                        
                        // Add the message
                        const newAgentMessage: ChatMessage = {
                            author: { id: agent.id, name: agent.name, profile: agent },
                            text: response.message,
                            timestamp: new Date().toISOString()
                        };
                        setMessages(prev => [...prev, newAgentMessage]);

                        // Wait for the gap between messages if it's not the last one
                        if (i < shuffledResponses.length - 1) {
                             setThinkingMessage(`AI friends are thinking...`); // Reset for next typing indicator
                             const nextMessageDelay = Math.random() * 4000 + 2000; // 2-6s gap
                             await new Promise(res => setTimeout(res, nextMessageDelay));
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error during message handling:", error);
            const errorMessage: ChatMessage = {
                author: { id: 'system', name: 'System' },
                text: `An API error occurred. Please check if your API key is valid in the settings.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
            setThinkingMessage('');
        }
    }, [isThinking, messages, agents, userProfile, setMessages]);

    const handleAddAgent = useCallback(() => {
        const newId = `agent-${Date.now()}`;
        const newAgent: AgentProfile = {
            id: newId,
            name: `Agent ${agents.length + 1}`,
            profession: Profession.Friend,
            emotion: Emotion.Neutral,
            gender: Gender.Female,
            age: 25,
            personalityTraits: [],
            avatarUrl: '',
            voiceType: VoiceType.Prebuilt,
            voiceName: 'Zephyr',
            speakingStyle: SpeakingStyle.Expressive,
            customVoiceUrl: '',
        };
        setAgents(prev => [...prev, newAgent]);
        setEditingAgent(newAgent);
    }, [agents.length, setAgents]);
    
    const handleSelectAgentToEdit = useCallback((agent: AgentProfile) => {
        setEditingAgent(agent);
    }, []);

    const handleCloseEditor = useCallback(() => {
        setEditingAgent(null);
    }, []);



    const handleUpdateAgent = useCallback((updatedAgent: AgentProfile) => {
        setAgents(prev => prev.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent));
    }, [setAgents]);

    const handleRemoveAgent = useCallback((agentId: string) => {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        setEditingAgent(null); // Close editor if the edited agent is removed
    }, [setAgents]);

    const handleStartCall = useCallback((agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            setEditingAgent(null); // Close editor before starting call
            setAgentInCall(agent);
            setView('call');
        } else {
            console.error(`Could not find agent with id ${agentId} to start call.`);
        }
    }, [agents]);

    const handleEndCall = useCallback(() => {
        setView('chat');
        setAgentInCall(null);
    }, []);

    const handleUpdateUserProfile = useCallback((profile: UserProfile) => {
        setUserProfile(profile);
    }, [setUserProfile]);

    const handleOpenImagePreview = useCallback((url: string) => {
        setPreviewImageUrl(url);
    }, []);

    const handleCloseImagePreview = useCallback(() => {
        setPreviewImageUrl(null);
    }, []);

    if (view === 'call' && agentInCall) {
        return <CallView agent={agentInCall} onEndCall={handleEndCall} />;
    }

    return (
        <>
            <ChatView
                agents={agents}
                messages={messages}
                isThinking={isThinking}
                thinkingMessage={thinkingMessage}
                onSendMessage={handleSendMessage}
                onStartCall={handleStartCall}
                onAddAgent={handleAddAgent}
                onUpdateAgent={handleUpdateAgent}
                // FIX: The prop was being passed the undefined variable 'onRemoveAgent' instead of 'handleRemoveAgent'.
                onRemoveAgent={handleRemoveAgent}
                editingAgent={editingAgent}
                onSelectAgentToEdit={handleSelectAgentToEdit}
                onCloseEditor={handleCloseEditor}
                userProfile={userProfile}
                onUpdateUserProfile={handleUpdateUserProfile}
                isUserProfileModalOpen={isUserProfileModalOpen}
                onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
                onCloseUserProfile={() => setIsUserProfileModalOpen(false)}
                onOpenImagePreview={handleOpenImagePreview}
                apiKey={apiKey}
                onUpdateApiKey={handleUpdateApiKey}
            />
            <ImagePreviewModal imageUrl={previewImageUrl} onClose={handleCloseImagePreview} />
        </>
    );
};

export default App;

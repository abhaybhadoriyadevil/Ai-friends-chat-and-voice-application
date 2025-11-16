
import React, { useState } from 'react';
import { AgentProfile, ChatMessage, UserProfile } from '../types';
import ChatWindow from './ChatWindow';
import Header from './Header';
import AgentManagerPanel from './AgentManagerPanel';
import AgentEditorModal from './AgentEditorModal';
import UserProfileModal from './UserProfileModal';
import { UsersIcon } from './icons/UsersIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface ChatViewProps {
    agents: AgentProfile[];
    messages: ChatMessage[];
    isThinking: boolean;
    thinkingMessage: string;
    onSendMessage: (text: string) => void;
    onStartCall: (agentId: string) => void;
    onAddAgent: () => void;
    onUpdateAgent: (agent: AgentProfile) => void;
    onRemoveAgent: (agentId: string) => void;
    editingAgent: AgentProfile | null;
    onSelectAgentToEdit: (agent: AgentProfile) => void;
    onCloseEditor: () => void;
    userProfile: UserProfile;
    onUpdateUserProfile: (profile: UserProfile) => void;
    isUserProfileModalOpen: boolean;
    onOpenUserProfile: () => void;
    onCloseUserProfile: () => void;
    onOpenImagePreview: (url: string) => void;
    apiKey: string;
    onUpdateApiKey: (key: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    agents,
    messages,
    isThinking,
    thinkingMessage,
    onSendMessage,
    onStartCall,
    onAddAgent,
    onUpdateAgent,
    onRemoveAgent,
    editingAgent,
    onSelectAgentToEdit,
    onCloseEditor,
    userProfile,
    onUpdateUserProfile,
    isUserProfileModalOpen,
    onOpenUserProfile,
    onCloseUserProfile,
    onOpenImagePreview,
    apiKey,
    onUpdateApiKey,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-100 overflow-hidden">
            <AgentManagerPanel 
                agents={agents}
                onAddAgent={onAddAgent}
                onEditAgent={onSelectAgentToEdit}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex flex-col flex-grow min-w-0">
                <Header
                    actions={
                        <>
                             <button
                                onClick={onOpenUserProfile}
                                className="text-gray-300 hover:text-white p-2 rounded-full transition-colors"
                                title="Settings"
                            >
                                <SettingsIcon />
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden text-gray-300 hover:text-white p-2 rounded-full transition-colors"
                                title="Manage Agents"
                            >
                                <UsersIcon />
                            </button>
                        </>
                    }
                />
                <main className="flex-grow flex flex-col h-full min-h-0">
                    <ChatWindow
                        messages={messages}
                        isThinking={isThinking}
                        thinkingMessage={thinkingMessage}
                        onSendMessage={onSendMessage}
                        onOpenImagePreview={onOpenImagePreview}
                    />
                </main>
            </div>
            <AgentEditorModal
                isOpen={!!editingAgent}
                onClose={onCloseEditor}
                agent={editingAgent}
                onUpdateAgent={onUpdateAgent}
                onRemoveAgent={onRemoveAgent}
                onStartCall={onStartCall}
                canRemove={agents.length > 1}
            />
            <UserProfileModal
                isOpen={isUserProfileModalOpen}
                onClose={onCloseUserProfile}
                userProfile={userProfile}
                onUpdateUserProfile={onUpdateUserProfile}
                onOpenImagePreview={onOpenImagePreview}
                apiKey={apiKey}
                onUpdateApiKey={onUpdateApiKey}
            />
        </div>
    );
};

export default ChatView;

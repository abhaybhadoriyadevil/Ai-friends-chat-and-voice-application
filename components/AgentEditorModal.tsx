
import React from 'react';
import { AgentProfile } from '../types';
import AgentCard from './AgentCard';
import { PROFESSIONS, EMOTIONS, GENDERS, PERSONALITY_TRAITS } from '../constants';

interface AgentEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: AgentProfile | null;
    onUpdateAgent: (agent: AgentProfile) => void;
    onRemoveAgent: (agentId: string) => void;
    onStartCall: (agentId: string) => void;
    canRemove: boolean;
}

const AgentEditorModal: React.FC<AgentEditorModalProps> = ({ isOpen, onClose, agent, onUpdateAgent, onRemoveAgent, onStartCall, canRemove }) => {
    if (!isOpen || !agent) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh] max-h-[900px] p-4 md:p-6 border border-gray-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                    <AgentCard
                        agent={agent}
                        onUpdateAgent={onUpdateAgent}
                        onRemoveAgent={onRemoveAgent}
                        onStartCall={onStartCall}
                        professions={PROFESSIONS}
                        emotions={EMOTIONS}
                        genders={GENDERS}
                        personalityTraits={PERSONALITY_TRAITS}
                        canRemove={canRemove}
                    />
                </div>
                <div className="mt-4 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentEditorModal;


import React from 'react';
import { AgentProfile } from '../types';
import { PROFESSION_ICON_MAP } from '../constants';
import { XIcon } from './icons/XIcon';

interface AgentManagerPanelProps {
    agents: AgentProfile[];
    onAddAgent: () => void;
    onEditAgent: (agent: AgentProfile) => void;
    isOpen: boolean;
    onClose: () => void;
}

const AgentManagerPanel: React.FC<AgentManagerPanelProps> = ({ agents, onAddAgent, onEditAgent, isOpen, onClose }) => {
    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            
            <aside className={`fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 w-72 flex flex-col p-4 z-40 transition-transform md:relative md:translate-x-0 md:w-80 md:shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-2xl font-bold text-white">AI Friends</h2>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <XIcon />
                    </button>
                </div>

                <div className="space-y-1 overflow-y-auto flex-grow pr-1 -mr-1">
                    {agents.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => onEditAgent(agent)}
                            className="w-full text-left flex items-center gap-3 p-3 rounded-md transition-colors hover:bg-gray-700/60 text-gray-200"
                            title={`Edit ${agent.name}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                                {agent.avatarUrl ? (
                                    <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{PROFESSION_ICON_MAP[agent.profession]}</span>
                                )}
                            </div>
                            <span className="font-medium truncate flex-grow">{agent.name}</span>
                            <span className="text-gray-400 text-xs">{agent.profession}</span>
                        </button>
                    ))}
                    {agents.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <p>No AI friends yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 shrink-0">
                    <button
                        onClick={onAddAgent}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        + Add New Friend
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AgentManagerPanel;

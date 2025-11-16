
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface ChatWindowProps {
    messages: ChatMessage[];
    isThinking: boolean;
    thinkingMessage: string;
    onSendMessage: (text: string) => void;
    onOpenImagePreview: (url: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isThinking, thinkingMessage, onSendMessage, onOpenImagePreview }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    return (
        <div className="flex flex-col h-full bg-gray-800/70">
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} onOpenImagePreview={onOpenImagePreview} />
                    ))}
                    {isThinking && (
                        <div className="flex items-center space-x-2 text-gray-400 animate-pulse">
                           <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>
                           <div className="text-sm p-2 bg-gray-700 rounded-lg">{thinkingMessage}</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 md:p-6 bg-gray-900/50 border-t border-gray-700/50">
                <div className="max-w-4xl mx-auto">
                    <ChatInput onSendMessage={onSendMessage} isThinking={isThinking} />
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

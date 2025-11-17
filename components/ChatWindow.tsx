
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
                         <div className="flex items-end gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>
                            <div className="flex flex-col items-start">
                                 <div className="p-3 rounded-lg max-w-[85%] sm:max-w-lg bg-gray-700 text-gray-200 rounded-bl-none">
                                     <div className="flex items-center justify-center gap-1.5 h-5">
                                         <span className="w-2 h-2 bg-gray-400 rounded-full animate-bouncing-dots" style={{ animationDelay: '0s' }}></span>
                                         <span className="w-2 h-2 bg-gray-400 rounded-full animate-bouncing-dots" style={{ animationDelay: '0.2s' }}></span>
                                         <span className="w-2 h-2 bg-gray-400 rounded-full animate-bouncing-dots" style={{ animationDelay: '0.4s' }}></span>
                                     </div>
                                 </div>
                            </div>
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

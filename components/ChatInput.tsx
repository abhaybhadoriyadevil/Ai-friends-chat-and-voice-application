
import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isThinking: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isThinking }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isThinking) {
            onSendMessage(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                disabled={isThinking}
                className="flex-grow bg-gray-700/80 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
                type="submit"
                disabled={isThinking || !text.trim()}
                className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                <SendIcon />
            </button>
        </form>
    );
};

export default ChatInput;

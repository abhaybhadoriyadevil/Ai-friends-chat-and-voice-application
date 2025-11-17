
import React from 'react';
import { ChatMessage } from '../types';
import { EMOTION_AVATAR_MAP } from '../constants';

interface MessageBubbleProps {
    message: ChatMessage;
    onOpenImagePreview: (url: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onOpenImagePreview }) => {
    const { author, text } = message;
    const isUser = author.id === 'user';
    const isSystem = author.id === 'system';
    const isAgent = !isUser && !isSystem;

    const avatarUrl = isUser ? author.avatarUrl : author.profile?.avatarUrl;
    
    const fallbackAvatar = isAgent && author.profile
        ? EMOTION_AVATAR_MAP[author.profile.emotion]
        : isUser ? '👤' : '⚙️';
    
    const bubbleClasses = isUser
        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none'
        : isAgent
        ? 'bg-gray-700 text-gray-200 rounded-bl-none shadow-lg'
        : 'bg-transparent text-gray-400 text-center text-sm w-full';

    const containerClasses = isUser
        ? 'justify-end'
        : isSystem 
        ? 'justify-center'
        : 'justify-start';

    if (isSystem) {
        return (
            <div className={`flex ${containerClasses} my-2`}>
                <div className={`${bubbleClasses} py-1 px-3`}>
                    <p>{text}</p>
                </div>
            </div>
        );
    }
    
    const renderAvatar = () => (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
                <img src={avatarUrl} alt={author.name} className="w-full h-full object-cover" />
            ) : (
                <span>{fallbackAvatar}</span>
            )}
        </div>
    );

    const AvatarWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        if (avatarUrl) {
            return (
                <button
                    onClick={() => onOpenImagePreview(avatarUrl)}
                    className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 rounded-full"
                    title={`View ${author.name}'s avatar`}
                >
                    {children}
                </button>
            );
        }
        return <>{children}</>;
    };

    return (
        <div className={`flex items-end gap-3 ${containerClasses}`}>
            {!isUser && (
                <AvatarWrapper>{renderAvatar()}</AvatarWrapper>
            )}
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && <p className="text-sm text-gray-400 mb-1">{author.name}</p>}
                <div className={`p-3 rounded-lg max-w-[85%] sm:max-w-lg ${bubbleClasses}`}>
                    <p className="whitespace-pre-wrap">{text}</p>
                </div>
            </div>
             {isUser && (
                <AvatarWrapper>{renderAvatar()}</AvatarWrapper>
            )}
        </div>
    );
};

export default MessageBubble;

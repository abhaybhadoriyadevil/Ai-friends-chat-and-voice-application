import React, { useRef } from 'react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onUpdateUserProfile: (profile: UserProfile) => void;
    onOpenImagePreview: (url: string) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userProfile, onUpdateUserProfile, onOpenImagePreview }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    if (!isOpen) return null;

    const handleChange = (field: keyof UserProfile, value: string) => {
        onUpdateUserProfile({ ...userProfile, [field]: value });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                onUpdateUserProfile({ ...userProfile, avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        onUpdateUserProfile({ ...userProfile, avatarUrl: '' });
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col p-6 md:p-8 border border-gray-700"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-white mb-6">Your Profile</h2>

                <div className="flex flex-col items-center mb-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl text-gray-400 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 group relative cursor-pointer"
                        title="Click to upload a new avatar"
                    >
                        {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>'👤'</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                            Upload
                        </div>
                    </button>
                    {userProfile.avatarUrl && (
                         <div className="flex items-center gap-4 mt-4">
                             <button
                                onClick={() => onOpenImagePreview(userProfile.avatarUrl!)}
                                className="text-sm font-medium text-indigo-400 hover:underline"
                                >
                                View Full Size
                            </button>
                            <button
                                onClick={handleRemoveAvatar}
                                className="text-sm font-medium text-red-500 hover:underline"
                            >
                                Remove Avatar
                            </button>
                         </div>
                    )}
                </div>

                <div className="space-y-4">
                     <div>
                        <label htmlFor="userAvatarUrl" className="block mb-2 text-sm font-medium text-gray-300">Avatar URL</label>
                        <input
                            type="text"
                            id="userAvatarUrl"
                            value={userProfile.avatarUrl || ''}
                            onChange={(e) => handleChange('avatarUrl', e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            placeholder="Paste URL or click avatar to upload"
                        />
                    </div>
                    <div>
                        <label htmlFor="userName" className="block mb-2 text-sm font-medium text-gray-300">Name</label>
                        <input
                            type="text"
                            id="userName"
                            value={userProfile.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="userBio" className="block mb-2 text-sm font-medium text-gray-300">Bio</label>
                        <textarea
                            id="userBio"
                            rows={4}
                            value={userProfile.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            placeholder="Tell us a little about yourself"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
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

export default UserProfileModal;

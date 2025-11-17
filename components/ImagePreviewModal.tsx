
import React from 'react';
import { XIcon } from './icons/XIcon';

interface ImagePreviewModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-200 animate-zoomIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-preview"
        >
            <div
                className="relative max-w-4xl max-h-[90vh] flex"
                onClick={e => e.stopPropagation()} 
            >
                <img
                    id="image-preview"
                    src={imageUrl}
                    alt="Profile preview"
                    className="object-contain rounded-lg shadow-2xl"
                />
            </div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                title="Close"
                aria-label="Close image preview"
            >
                <XIcon />
            </button>
        </div>
    );
};

export default ImagePreviewModal;

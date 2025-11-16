import React from 'react';

interface HeaderProps {
    actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ actions }) => {
    return (
        <header className="bg-gray-900/80 border-b border-gray-700/50 backdrop-blur-sm p-4 flex justify-between items-center z-10 shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                AI Friends
            </h1>
            <div className="flex items-center gap-2">
                {actions}
            </div>
        </header>
    );
};

export default Header;
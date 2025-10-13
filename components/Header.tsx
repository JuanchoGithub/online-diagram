import React from 'react';
import type { View, ThemeName } from '../types';
import { THEMES } from '../constants';
import { Icon } from './Icon';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View, topic?: string) => void;
    currentTheme: ThemeName;
    onThemeChange: (theme: ThemeName) => void;
    onToggleLibrary: () => void;
}

const NavButton: React.FC<{
    isActive?: boolean;
    onClick: () => void;
    iconName: string;
    children: React.ReactNode;
}> = ({ isActive = false, onClick, iconName, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-indigo-500 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        <Icon name={iconName} className="h-5 w-5" />
        {children}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, currentTheme, onThemeChange, onToggleLibrary }) => {
    return (
        <header className="bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-2 text-white text-xl font-bold">
                             <Icon name="logo" className="h-8 w-8 text-indigo-400" />
                            <span>Mermaid Studio</span>
                        </div>
                        <nav className="flex space-x-2">
                            <NavButton isActive={currentView === 'editor'} onClick={() => onNavigate('editor')} iconName="editor">Editor</NavButton>
                            <NavButton isActive={currentView === 'visual-builder'} onClick={() => onNavigate('visual-builder')} iconName="visual">Visual Builder</NavButton>
                            <NavButton isActive={currentView === 'tutorial'} onClick={() => onNavigate('tutorial', 'flowchart')} iconName="tutorial">Tutorial</NavButton>
                             <div className="border-l border-gray-600 mx-2"></div>
                            <NavButton onClick={onToggleLibrary} iconName="library">My Diagrams</NavButton>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label htmlFor="theme-select" className="text-sm font-medium text-gray-300">Theme:</label>
                        <select
                            id="theme-select"
                            value={currentTheme}
                            onChange={(e) => onThemeChange(e.target.value as ThemeName)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                        >
                            {Object.entries(THEMES).map(([key, theme]) => (
                                <option key={key} value={key}>{theme.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </header>
    );
};

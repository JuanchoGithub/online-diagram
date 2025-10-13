import React, { useState } from 'react';
import { SHAPE_CATEGORIES, Shape } from './shapesData';
import type { ThemeName } from '../types';
import { Icon } from './Icon';
import { TutorialDiagram } from './TutorialDiagram';

interface ShapesPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onAddShape: (shape: Shape) => void;
    theme: ThemeName;
}

export const ShapesPalette: React.FC<ShapesPaletteProps> = ({ isOpen, onClose, onAddShape, theme }) => {
    const [activeTab, setActiveTab] = useState(SHAPE_CATEGORIES[0].name);

    if (!isOpen) return null;

    const activeCategory = SHAPE_CATEGORIES.find(c => c.name === activeTab);

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Icon name="shapes" className="w-6 h-6" />
                        Shapes Palette
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Tabs */}
                    <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-2 overflow-y-auto">
                        <ul className="space-y-1">
                            {SHAPE_CATEGORIES.map(category => (
                                <li key={category.name}>
                                    <button
                                        onClick={() => setActiveTab(category.name)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                            activeTab === category.name ? 'bg-indigo-500 text-white' : 'hover:bg-gray-700 text-gray-300'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Tab Content */}
                    <div className="w-3/4 p-6 overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {activeCategory?.shapes.map(shape => (
                                <button
                                    key={shape.name}
                                    onClick={() => onAddShape(shape)}
                                    title={shape.description}
                                    className="bg-gray-700 rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105"
                                >
                                    <div className="h-16 w-full flex items-center justify-center">
                                        <TutorialDiagram
                                            id={`shape-preview-${shape.name.replace(/[\s/]/g, '-')}`}
                                            code={shape.previewCode}
                                            theme={theme}
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-gray-200">{shape.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
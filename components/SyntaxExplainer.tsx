import React, { useState, useEffect } from 'react';
import { syntaxService } from '../services/syntaxService';
import type { SyntaxExplanation, View } from '../types';
import { Icon } from './Icon';

interface SyntaxExplainerProps {
    code: string;
    cursorPosition: number;
    onNavigate: (view: View, topic?: string, section?: string) => void;
}

export const SyntaxExplainer: React.FC<SyntaxExplainerProps> = ({ code, cursorPosition, onNavigate }) => {
    const [explanation, setExplanation] = useState<SyntaxExplanation | null>(null);
    const [related, setRelated] = useState<SyntaxExplanation[] | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [diagramInfo, setDiagramInfo] = useState<{ type: string; tutorialTopic: string } | null>(null);

    useEffect(() => {
        const { explanation, related, category, diagramType, tutorialTopic } = syntaxService.getExplanationForPosition(code, cursorPosition);
        setExplanation(explanation);
        setRelated(related);
        setCategory(category);
        if (diagramType && tutorialTopic) {
            setDiagramInfo({ type: diagramType, tutorialTopic });
        } else {
            setDiagramInfo(null);
        }
    }, [code, cursorPosition]);

    const handleGeneralTutorialClick = () => {
        if (diagramInfo) {
            onNavigate('tutorial', diagramInfo.tutorialTopic);
        }
    };
    
    const handleCategoryTutorialClick = () => {
        if (diagramInfo && category) {
            onNavigate('tutorial', diagramInfo.tutorialTopic, category);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="flex-shrink-0 bg-gray-700 p-2 px-4 rounded-t-lg flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-300">Syntax Helper</h3>
                {diagramInfo && (
                    <button 
                        onClick={handleGeneralTutorialClick}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                        title={`Open ${diagramInfo.type} Tutorial`}
                    >
                        <Icon name="book" className="h-4 w-4" />
                        <span>Tutorial</span>
                    </button>
                )}
            </div>
            <div className="flex-grow p-4 overflow-y-auto text-sm">
                {explanation ? (
                    <>
                        <div className="space-y-4">
                            <h4 className="font-bold text-indigo-400 text-base">{explanation.title}</h4>
                            <p className="text-gray-300 leading-relaxed">{explanation.description}</p>
                            {explanation.example && (
                                <div>
                                    <h5 className="text-xs font-semibold text-gray-400 mb-1 uppercase">Example</h5>
                                    <pre className="bg-gray-900 p-2 rounded-md text-gray-200 text-xs font-mono whitespace-pre-wrap">
                                        <code>{explanation.example}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                        {related && related.length > 0 && category && (
                            <div className="mt-6 pt-4 border-t border-gray-600">
                                <h5 className="text-sm font-semibold text-gray-300 mb-3">Related {category} Syntax</h5>
                                <ul className="space-y-3">
                                    {related.map(item => (
                                        <li key={item.title}>
                                            <p className="font-semibold text-gray-200 text-xs">{item.title}</p>
                                            <p className="text-xs text-gray-400">{item.description.split('.')[0]}.</p>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={handleCategoryTutorialClick} className="text-indigo-400 hover:text-indigo-300 text-xs mt-4 w-full text-left font-semibold">
                                    Learn more about {category} for {diagramInfo?.type}...
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-500 pt-8 flex flex-col items-center gap-3 h-full justify-center">
                        <Icon name="info" className="w-8 h-8"/>
                        <p>Click on a keyword in the editor or start typing to see a real-time explanation here.</p>
                        {diagramInfo && <p className="text-xs mt-4">Current diagram type: <span className="font-semibold text-gray-400">{diagramInfo.type}</span></p>}
                    </div>
                )}
            </div>
        </div>
    );
};

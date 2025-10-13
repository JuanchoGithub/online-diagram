
import React from 'react';
import { TUTORIAL_STEPS } from '../../constants';
import type { View } from '../../types';
import { Button } from '../Button';
import { Icon } from '../Icon';

interface TutorialViewProps {
    onSelectCodeSnippet: (code: string, targetView: View) => void;
}

export const TutorialView: React.FC<TutorialViewProps> = ({ onSelectCodeSnippet }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Mermaid.js Tutorial</h1>
            <p className="text-gray-400 mb-8">Learn how to create powerful diagrams with simple text. Click "Try it in Editor" to see a snippet in action!</p>
            
            <div className="space-y-6">
                {TUTORIAL_STEPS.map((step, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-indigo-400 mb-2">{step.title}</h2>
                            <p className="text-gray-300 mb-4">{step.description}</p>
                        </div>
                        <div className="bg-gray-900 p-4">
                            <pre className="text-sm text-gray-200 bg-gray-900 rounded-md p-4 overflow-x-auto">
                                <code>{step.code}</code>
                            </pre>
                            <div className="mt-4 text-right">
                                <Button onClick={() => onSelectCodeSnippet(step.code, 'editor')}>
                                    <Icon name="editor" className="w-4 h-4 mr-2" />
                                    Try it in Editor
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

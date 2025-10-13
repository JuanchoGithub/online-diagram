import React, { useEffect, useRef } from 'react';
import { TUTORIALS } from '../../tutorials';
import type { View, ThemeName } from '../../types';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { TutorialDiagram } from '../TutorialDiagram';

interface TutorialViewProps {
    onSelectCodeSnippet: (code: string, targetView: View) => void;
    topic: string;
    section?: string;
    onNavigate: (view: View, topic: string) => void;
    theme: ThemeName;
}

export const TutorialView: React.FC<TutorialViewProps> = ({ onSelectCodeSnippet, topic, section, onNavigate, theme }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const tutorial = TUTORIALS[topic] || TUTORIALS.flowchart;

    useEffect(() => {
        if (section && contentRef.current) {
            const element = contentRef.current.querySelector(`#tutorial-section-${section.toLowerCase()}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
             contentRef.current?.scrollTo(0, 0);
        }
    }, [topic, section]);

    return (
        <div className="flex flex-col md:flex-row gap-8 max-h-[calc(100vh-8rem)]">
            {/* Sidebar */}
            <aside className="w-full md:w-1/4 flex-shrink-0">
                <div className="bg-gray-800 rounded-lg p-4 sticky top-24">
                    <h2 className="text-lg font-semibold text-white mb-4">Diagram Types</h2>
                    <ul className="space-y-2">
                        {Object.entries(TUTORIALS).map(([key, value]) => (
                            <li key={key}>
                                <button
                                    onClick={() => onNavigate('tutorial', key)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                        topic === key ? 'bg-indigo-500 text-white' : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                                >
                                    {value.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <main ref={contentRef} className="w-full md:w-3/4 overflow-y-auto pr-2">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-2">{tutorial.title}</h1>
                    <p className="text-gray-400 mb-8">{tutorial.description}</p>
                    
                    <div className="space-y-8">
                        {tutorial.categories.map((category) => (
                            <div key={category.id} id={`tutorial-section-${category.id.toLowerCase()}`}>
                                <h2 className="text-2xl font-semibold text-indigo-400 mb-4 pb-2 border-b-2 border-gray-700">{category.title}</h2>
                                <div className="space-y-6">
                                    {category.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                            <div className="p-6">
                                                <h3 className="text-lg font-semibold text-gray-200 mb-2">{step.title}</h3>
                                                <p className="text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: step.description }}></p>
                                                
                                                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 my-4 flex items-center justify-center">
                                                    <TutorialDiagram
                                                        id={`tutorial-diag-${topic}-${category.id}-${stepIndex}`}
                                                        code={step.code}
                                                        theme={theme}
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-gray-900 p-4">
                                                <pre className="text-sm text-gray-200 bg-gray-900 rounded-md p-4 overflow-x-auto">
                                                    <code>{step.code}</code>
                                                </pre>
                                                <div className="mt-4 text-right">
                                                    <Button onClick={() => onSelectCodeSnippet(step.code, 'editor')}>
                                                        <Icon name="editor" className="w-4 h-4 mr-2" />
                                                        Try in Editor
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
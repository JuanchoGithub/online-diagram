import React from 'react';
import { CHART_EXAMPLES } from '../constants';
import { Icon } from './Icon';

interface CodeEditorProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    onChartSelect: (newCode: string) => void;
    onUndo: () => void;
    canUndo: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, onChartSelect, onUndo, canUndo }) => {
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = event.target.value;
        if (selectedCode) {
            onChartSelect(selectedCode);
            event.target.value = ""; 
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="flex-shrink-0 bg-gray-700 p-2 px-4 rounded-t-lg flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-300">Mermaid Code</h3>
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Undo last template load"
                        title="Undo last template load (Cmd+Z)"
                    >
                        <Icon name="undo" className="h-5 w-5" />
                    </button>
                    <select 
                        onChange={handleSelectChange}
                        className="bg-gray-800 border border-gray-600 text-white text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-1"
                        aria-label="Load a chart template"
                    >
                        <option value="">Load a template...</option>
                        {CHART_EXAMPLES.map(example => (
                            <option key={example.name} value={example.code}>
                                {example.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                className="w-full flex-grow bg-transparent text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none"
                placeholder="Enter Mermaid syntax here..."
                spellCheck="false"
            />
        </div>
    );
};
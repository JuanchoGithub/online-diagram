import React from 'react';
import { CHART_EXAMPLES } from '../constants';
import { Icon } from './Icon';

interface CodeEditorProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    onChartSelect: (newCode: string) => void;
    onUndo: () => void;
    canUndo: boolean;
    onCursorChange: (position: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, onChartSelect, onUndo, canUndo, onCursorChange }) => {
    const lineNumbersRef = React.useRef<HTMLPreElement>(null);
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

    const lineCount = React.useMemo(() => code.split('\n').length, [code]);
    const lineNumbers = React.useMemo(() => Array.from({ length: lineCount || 1 }, (_, i) => i + 1).join('\n'), [lineCount]);
    
    const handleScroll = () => {
        if (lineNumbersRef.current && textAreaRef.current) {
            lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
        }
    };
    
    const selectedTemplate = React.useMemo(() => {
        const trimmedCode = code.trim();
        return CHART_EXAMPLES.find(example => example.code.trim() === trimmedCode);
    }, [code]);
    
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = event.target.value;
        if (selectedCode) {
            onChartSelect(selectedCode);
        }
    };
    
    const handleCursorActivity = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        onCursorChange(e.currentTarget.selectionStart);
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
                        value={selectedTemplate ? selectedTemplate.code : ""}
                        onChange={handleSelectChange}
                        className="bg-gray-800 border border-gray-600 text-white text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-1"
                        aria-label="Load a chart template"
                    >
                        <option value="">Load a template...</option>
                        {CHART_EXAMPLES.map(example => (
                            <option key={example.name} value={example.code}>
                                {selectedTemplate?.code === example.code ? `Loaded: ${example.name}` : example.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="relative flex-grow overflow-hidden">
                <pre
                    ref={lineNumbersRef}
                    aria-hidden="true"
                    className="absolute top-0 left-0 h-full p-4 text-right text-gray-600 select-none pointer-events-none font-mono text-sm leading-relaxed"
                    style={{ width: '3rem' }}
                >
                    {lineNumbers}
                </pre>
                <textarea
                    ref={textAreaRef}
                    value={code}
                    onChange={(e) => {
                        onCodeChange(e.target.value);
                        handleCursorActivity(e);
                    }}
                    onKeyUp={handleCursorActivity}
                    onMouseUp={handleCursorActivity}
                    onScroll={handleScroll}
                    className="w-full h-full bg-transparent text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                    style={{ paddingLeft: '3.5rem' }}
                    placeholder="Enter Mermaid syntax here..."
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

import React from 'react';
import { CodeEditor } from '../CodeEditor';
import { DiagramPreview } from '../DiagramPreview';
import type { ThemeName } from '../../types';

interface EditorViewProps {
    code: string;
    setCode: (code: string) => void;
    onLoadTemplate: (newCode: string) => void;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
    onUndo: () => void;
    canUndo: boolean;
    theme: ThemeName;
}

export const EditorView: React.FC<EditorViewProps> = ({ code, setCode, onLoadTemplate, showToast, onUndo, canUndo, theme }) => {
    
    const handleChartSelect = (newCode: string) => {
        onLoadTemplate(newCode);
    };

    return (
        <div className="h-full">
            <div className="grid grid-rows-2 gap-6 h-[calc(100vh-12rem)]">
                <CodeEditor 
                    code={code} 
                    onCodeChange={setCode} 
                    onChartSelect={handleChartSelect}
                    onUndo={onUndo}
                    canUndo={canUndo}
                />
                <DiagramPreview code={code} onAction={showToast} theme={theme} />
            </div>
        </div>
    );
};

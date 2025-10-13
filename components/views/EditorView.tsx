import React, { useState } from 'react';
import { CodeEditor } from '../CodeEditor';
import { DiagramPreview } from '../DiagramPreview';
import { SyntaxExplainer } from '../SyntaxExplainer';
import type { ThemeName, View } from '../../types';

interface EditorViewProps {
    code: string;
    setCode: (code: string) => void;
    onLoadTemplate: (newCode: string) => void;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
    onUndo: () => void;
    canUndo: boolean;
    theme: ThemeName;
    onNavigate: (view: View, topic?: string, section?: string) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ code, setCode, onLoadTemplate, showToast, onUndo, canUndo, theme, onNavigate }) => {
    const [cursorPosition, setCursorPosition] = useState(0);

    const handleChartSelect = (newCode: string) => {
        onLoadTemplate(newCode);
    };

    return (
        <div className="h-full">
            <div className="grid grid-rows-2 gap-6 h-[calc(100vh-12rem)]">
                <div className="flex gap-6 h-full overflow-hidden">
                    <div className="w-2/3 h-full">
                        <CodeEditor 
                            code={code} 
                            onCodeChange={setCode} 
                            onChartSelect={handleChartSelect}
                            onUndo={onUndo}
                            canUndo={canUndo}
                            onCursorChange={setCursorPosition}
                        />
                    </div>
                    <div className="w-1/3 h-full">
                        <SyntaxExplainer 
                            code={code} 
                            cursorPosition={cursorPosition}
                            onNavigate={onNavigate}
                        />
                    </div>
                </div>
                <DiagramPreview code={code} showToast={showToast} theme={theme} />
            </div>
        </div>
    );
};

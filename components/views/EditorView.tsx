import React, { useState, useRef, useEffect, useCallback } from 'react';
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

    const [verticalSize, setVerticalSize] = useState(33.33); // percentage
    const [horizontalSize, setHorizontalSize] = useState(60); // percentage
    const [isVerticalDragging, setIsVerticalDragging] = useState(false);
    const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);

    const editorContainerRef = useRef<HTMLDivElement>(null);
    const leftPanelRef = useRef<HTMLDivElement>(null);

    const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsVerticalDragging(true);
    }, []);

    const handleHorizontalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsHorizontalDragging(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isVerticalDragging && editorContainerRef.current) {
                const containerRect = editorContainerRef.current.getBoundingClientRect();
                const newWidth = e.clientX - containerRect.left;
                const newSize = (newWidth / containerRect.width) * 100;
                setVerticalSize(Math.max(20, Math.min(80, newSize)));
            }
            if (isHorizontalDragging && leftPanelRef.current) {
                const containerRect = leftPanelRef.current.getBoundingClientRect();
                const newHeight = e.clientY - containerRect.top;
                const newSize = (newHeight / containerRect.height) * 100;
                setHorizontalSize(Math.max(20, Math.min(80, newSize)));
            }
        };

        const handleMouseUp = () => {
            setIsVerticalDragging(false);
            setIsHorizontalDragging(false);
        };

        if (isVerticalDragging || isHorizontalDragging) {
            document.body.style.userSelect = 'none';
            document.body.style.cursor = isVerticalDragging ? 'col-resize' : 'row-resize';
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mouseleave', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isVerticalDragging, isHorizontalDragging]);


    return (
        <div ref={editorContainerRef} className="flex h-[calc(100vh-6.5rem)] w-full">
            {/* Left Panel */}
            <div
                ref={leftPanelRef}
                className="flex flex-col h-full"
                style={{ width: `${verticalSize}%` }}
            >
                {/* Top: Code Editor */}
                <div className="h-full" style={{ height: `${horizontalSize}%` }}>
                    <CodeEditor
                        code={code}
                        onCodeChange={setCode}
                        onChartSelect={onLoadTemplate}
                        onUndo={onUndo}
                        canUndo={canUndo}
                        onCursorChange={setCursorPosition}
                    />
                </div>
                
                {/* Horizontal Divider */}
                <div
                    onMouseDown={handleHorizontalMouseDown}
                    className="w-full h-2 flex-shrink-0 cursor-row-resize bg-gray-700 hover:bg-indigo-500 transition-colors"
                />
                
                {/* Bottom: Syntax Explainer */}
                <div className="h-full" style={{ height: `calc(100% - ${horizontalSize}% - 8px)` }}>
                    <SyntaxExplainer
                        code={code}
                        cursorPosition={cursorPosition}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>

            {/* Vertical Divider */}
            <div
                onMouseDown={handleVerticalMouseDown}
                className="h-full w-2 flex-shrink-0 cursor-col-resize bg-gray-700 hover:bg-indigo-500 transition-colors"
            />

            {/* Right Panel */}
            <div className="h-full" style={{ width: `calc(100% - ${verticalSize}% - 8px)` }}>
                <DiagramPreview code={code} showToast={showToast} theme={theme} />
            </div>
        </div>
    );
};
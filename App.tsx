import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EditorView } from './components/views/EditorView';
import { TutorialView } from './components/views/TutorialView';
import { VisualBuilderView } from './components/views/VisualBuilderView';
import { DiagramLibrary } from './components/DiagramLibrary';
import { Toast } from './components/Toast';
import { StatusBar } from './components/StatusBar';
import type { View, ThemeName, Diagram, LogEntry } from './types';
import { DEFAULT_DIAGRAM_CODE, THEMES } from './constants';
import { getCookie, setCookie } from './services/cookieService';

interface StateSnapshot {
    code: string;
    currentDiagramId: string | null;
}

const App: React.FC = () => {
    const [view, setView] = useState<View>('editor');
    const [tutorialTopic, setTutorialTopic] = useState<string>('flowchart');
    const [tutorialSection, setTutorialSection] = useState<string | undefined>(undefined);
    const [theme, setTheme] = useState<ThemeName>('dark');
    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
    const [code, setCode] = useState<string>(DEFAULT_DIAGRAM_CODE);
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [history, setHistory] = useState<StateSnapshot[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [messageLog, setMessageLog] = useState<LogEntry[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
        if (type !== 'error') {
            setToast({ message, type });
            setTimeout(() => setToast(null), 3000);
        }

        const newLogEntry: LogEntry = {
            message,
            type,
            timestamp: new Date().toISOString()
        };
        setMessageLog(prevLog => [...prevLog, newLogEntry]);
    }, []);

    const handleNavigate = useCallback((targetView: View, topic?: string, section?: string) => {
        setView(targetView);
        if (topic) {
            setTutorialTopic(topic);
        }
        setTutorialSection(section);
        if (targetView !== 'tutorial') {
            setTutorialSection(undefined);
        }
    }, []);

    useEffect(() => {
        const savedDiagrams = getCookie('mermaid-diagrams');
        if (savedDiagrams) {
            try {
                const parsedDiagrams = JSON.parse(savedDiagrams);
                setDiagrams(parsedDiagrams);
                if (parsedDiagrams.length > 0) {
                    const lastUsedId = localStorage.getItem('mermaid-last-diagram-id') || parsedDiagrams[0].id;
                    const lastDiagram = parsedDiagrams.find((d: Diagram) => d.id === lastUsedId);
                    if (lastDiagram) {
                        setCode(lastDiagram.code);
                        setCurrentDiagramId(lastDiagram.id);
                    }
                }
            } catch (error) {
                console.error("Failed to parse diagrams from cookie", error);
                setDiagrams([]);
            }
        }
    }, []);
    
    const handleUndo = useCallback(() => {
        if (history.length === 0) {
            showToast("Nothing to undo.", 'info');
            return;
        }

        const lastState = history[history.length - 1];
        
        setCode(lastState.code);
        setCurrentDiagramId(lastState.currentDiagramId);
        if (lastState.currentDiagramId) {
            localStorage.setItem('mermaid-last-diagram-id', lastState.currentDiagramId);
        } else {
            localStorage.removeItem('mermaid-last-diagram-id');
        }

        setHistory(prev => prev.slice(0, prev.length - 1));
        setIsDirty(true); // Undoing is a modification
        showToast("Undo successful.", 'success');
    }, [history, showToast]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
                event.preventDefault();
                handleUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo]);

    useEffect(() => {
        setCookie('mermaid-diagrams', JSON.stringify(diagrams), 365);
    }, [diagrams]);

    const handleThemeChange = useCallback((newTheme: ThemeName) => {
        setTheme(newTheme);
        (window as any).mermaid.initialize({
            startOnLoad: false,
            theme: newTheme,
            ...THEMES[newTheme].config
        });
    }, []);

    useEffect(() => {
        handleThemeChange(theme);
    }, [theme, handleThemeChange]);

    const handleCodeFromOtherView = (newCode: string, sourceView: View) => {
        setCode(newCode);
        setHistory([]); // Clear history on manual code change from other views
        handleNavigate(sourceView);
        setIsDirty(true); // Code from other views is unsaved
    };
    
    const handleEditorCodeChange = (newCode: string) => {
        setCode(newCode);
        setIsDirty(true);
    };

    const handleLoadTemplate = (newCode: string) => {
        const snapshot: StateSnapshot = { code, currentDiagramId };
        setHistory(prev => [...prev, snapshot]);
        setCode(newCode);
        setCurrentDiagramId(null);
        localStorage.removeItem('mermaid-last-diagram-id');
        setIsDirty(false); // A fresh template is not dirty
        showToast("Template loaded! Use Ctrl/Cmd+Z to undo.", 'success');
    };
    
    const handleLoadDiagram = (diagram: Diagram) => {
        setCode(diagram.code);
        setCurrentDiagramId(diagram.id);
        localStorage.setItem('mermaid-last-diagram-id', diagram.id);
        setIsLibraryModalOpen(false);
        setIsDirty(false); // Loading a saved diagram is a clean state
    };
    
    const handleSaveDiagram = () => {
        if (currentDiagramId) {
            // Update existing diagram
            setDiagrams(diagrams.map(d => d.id === currentDiagramId ? { ...d, code: code, createdAt: new Date().toISOString() } : d));
        } else {
            // Create new diagram
            const title = prompt("Enter a title for your new diagram:", "New Diagram");
            if (title) {
                const newDiagram: Diagram = {
                    id: `diag-${Date.now()}`,
                    title,
                    code: code,
                    createdAt: new Date().toISOString(),
                };
                const newDiagrams = [...diagrams, newDiagram];
                setDiagrams(newDiagrams);
                setCurrentDiagramId(newDiagram.id);
                localStorage.setItem('mermaid-last-diagram-id', newDiagram.id);
            }
        }
        setIsDirty(false); // Saving creates a clean state
    };
    
    const handleNewDiagram = () => {
        setCurrentDiagramId(null);
        setCode('');
        localStorage.removeItem('mermaid-last-diagram-id');
        setIsLibraryModalOpen(false);
        setIsDirty(false); // A new diagram is a clean state
    };

    const handleDeleteDiagram = (id: string) => {
        if (window.confirm("Are you sure you want to delete this diagram?")) {
            setDiagrams(diagrams.filter(d => d.id !== id));
            if (currentDiagramId === id) {
                setCurrentDiagramId(null);
                setCode('');
                localStorage.removeItem('mermaid-last-diagram-id');
                setIsDirty(false);
            }
        }
    };


    const renderView = () => {
        switch (view) {
            case 'tutorial':
                return <TutorialView 
                    onSelectCodeSnippet={handleCodeFromOtherView} 
                    topic={tutorialTopic} 
                    section={tutorialSection}
                    onNavigate={handleNavigate}
                    theme={theme}
                />;
            case 'visual-builder':
                return <VisualBuilderView onGenerateCode={handleCodeFromOtherView} theme={theme} showToast={showToast} />;
            case 'editor':
            default:
                return (
                    <EditorView
                        code={code}
                        setCode={handleEditorCodeChange}
                        onLoadTemplate={handleLoadTemplate}
                        showToast={showToast}
                        onUndo={handleUndo}
                        canUndo={history.length > 0}
                        theme={theme}
                        onNavigate={handleNavigate}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 font-sans">
            <Header 
                currentView={view} 
                onNavigate={handleNavigate}
                currentTheme={theme}
                onThemeChange={handleThemeChange}
                onToggleLibrary={() => setIsLibraryModalOpen(true)}
            />
            <main className="flex-grow container mx-auto px-4 py-6 mb-10">
                {renderView()}
            </main>
            <DiagramLibrary
                isOpen={isLibraryModalOpen}
                onClose={() => setIsLibraryModalOpen(false)}
                diagrams={diagrams}
                currentCode={code}
                currentDiagramId={currentDiagramId}
                onLoadDiagram={handleLoadDiagram}
                onSaveDiagram={handleSaveDiagram}
                onNewDiagram={handleNewDiagram}
                onDeleteDiagram={handleDeleteDiagram}
            />
            <StatusBar log={messageLog} />
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
};

export default App;
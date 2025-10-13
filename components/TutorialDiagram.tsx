
import React, { useState, useEffect } from 'react';
import type { ThemeName } from '../types';

interface TutorialDiagramProps {
    id: string;
    code: string;
    theme: ThemeName;
}

export const TutorialDiagram: React.FC<TutorialDiagramProps> = ({ id, code, theme }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 1);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const renderMermaid = async () => {
            if (!code.trim()) {
                setSvg('');
                setError(null);
                return;
            }
            try {
                // Mermaid needs a unique ID for each render, which is passed via props
                const { svg } = await (window as any).mermaid.render(id, code);
                setSvg(svg);
                setError(null);
            } catch (e: any) {
                const errorMessage = e.message || 'Invalid Mermaid syntax.';
                setError(errorMessage);
                setSvg('');
            }
        };
        // Use a small timeout to allow the DOM to update, preventing race conditions with mermaid.
        const timeoutId = setTimeout(renderMermaid, 50);
        return () => clearTimeout(timeoutId);
    }, [id, code, theme, isMounted]);

    return (
        <div className="min-h-[50px]">
            {error && <div className="text-red-400 bg-red-900/50 p-2 rounded-md font-mono text-xs">{error}</div>}
            {!error && svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
            {!error && !svg && <div className="text-gray-500 text-sm">Loading diagram...</div>}
        </div>
    );
};

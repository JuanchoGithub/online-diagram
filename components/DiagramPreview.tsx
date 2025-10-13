
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import type { ThemeName } from '../types';

interface DiagramPreviewProps {
    code: string;
    onAction: (message: string) => void;
    theme: ThemeName;
}

export const DiagramPreview: React.FC<DiagramPreviewProps> = ({ code, onAction, theme }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const mermaidId = 'mermaid-preview';

    useEffect(() => {
        const renderMermaid = async () => {
            if (!code.trim()) {
                setSvg('');
                setError(null);
                return;
            }
            try {
                const { svg } = await (window as any).mermaid.render(mermaidId, code);
                setSvg(svg);
                setError(null);
            } catch (e: any) {
                setError(e.message || 'Invalid Mermaid syntax.');
                setSvg('');
            }
        };
        // Debounce rendering
        const timeoutId = setTimeout(renderMermaid, 300);
        return () => clearTimeout(timeoutId);
    }, [code, theme]);
    
    const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportSVG = useCallback(() => {
        if (!svg) return;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        downloadFile(blob, 'diagram.svg');
        onAction('SVG exported!');
    }, [svg, onAction]);

    const handleExportPNG = useCallback(() => {
        if (!svg || !previewRef.current) return;
        const svgElement = previewRef.current.querySelector('svg');
        if (!svgElement) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = img.width * 2; // Increase resolution
            canvas.height = img.height * 2;
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if(blob) downloadFile(blob, 'diagram.png');
                onAction('PNG exported!');
            }, 'image/png');
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }, [svg, onAction]);

    const handleCopyToClipboard = useCallback(async () => {
        if (!svg || !previewRef.current) return;
        try {
            const svgElement = previewRef.current.querySelector('svg');
            if (!svgElement) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const img = new Image();
            const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                 canvas.width = img.width;
                 canvas.height = img.height;
                 ctx.drawImage(img, 0, 0);
                 canvas.toBlob(async (blob) => {
                     if (blob) {
                         await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                         onAction('PNG copied to clipboard!');
                     }
                 }, 'image/png');
                 URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (err) {
            console.error('Failed to copy image:', err);
            onAction('Failed to copy image.');
        }
    }, [svg, onAction]);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="flex-shrink-0 bg-gray-700 p-2 px-4 rounded-t-lg flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-300">Preview</h3>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExportSVG} disabled={!svg}><Icon name="download" className="w-4 h-4 mr-1"/>SVG</Button>
                    <Button onClick={handleExportPNG} disabled={!svg}><Icon name="download" className="w-4 h-4 mr-1"/>PNG</Button>
                    <Button onClick={handleCopyToClipboard} disabled={!svg}><Icon name="copy" className="w-4 h-4 mr-1"/>Copy PNG</Button>
                </div>
            </div>
            <div ref={previewRef} className="flex-grow p-4 overflow-auto flex items-center justify-center">
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md font-mono text-sm">{error}</div>}
                {!error && svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
                {!error && !svg && <div className="text-gray-500">Your diagram will appear here.</div>}
            </div>
        </div>
    );
};

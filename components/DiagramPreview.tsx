
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import type { ThemeName } from '../types';

interface DiagramPreviewProps {
    code: string;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
    theme: ThemeName;
}

const getExportInfo = (svg: string): { svgForExport: string, width: number, height: number } | null => {
    try {
        const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
        if (!viewBoxMatch || !viewBoxMatch[1]) return null;
        
        const viewBox = viewBoxMatch[1].split(/\s+/);
        if (viewBox.length !== 4) return null;
        
        const width = parseFloat(viewBox[2]);
        const height = parseFloat(viewBox[3]);
    
        if (!width || !height || !isFinite(width) || !isFinite(height)) return null;
    
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svg;
        const svgElement = tempDiv.querySelector('svg');
    
        if (svgElement) {
            svgElement.setAttribute('width', `${width}`);
            svgElement.setAttribute('height', `${height}`);
            svgElement.style.maxWidth = 'none';
            return { svgForExport: svgElement.outerHTML, width, height };
        }
        return null;
    } catch (e) {
        console.error("Error processing SVG for export:", e);
        return null;
    }
}


export const DiagramPreview: React.FC<DiagramPreviewProps> = ({ code, showToast, theme }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [isMounted, setIsMounted] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);
    const mermaidId = 'mermaid-preview';

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
                // Reset view when code changes
                setTransform({ scale: 1, x: 0, y: 0 });
                const { svg } = await (window as any).mermaid.render(mermaidId, code);
                setSvg(svg);
                setError(null);
            } catch (e: any) {
                const errorMessage = e.message || 'Invalid Mermaid syntax.';
                setError(errorMessage);
                showToast(errorMessage, 'error');
                setSvg('');
            }
        };
        const timeoutId = setTimeout(renderMermaid, 300);
        return () => clearTimeout(timeoutId);
    }, [code, theme, showToast, isMounted]);
    
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
        const exportInfo = getExportInfo(svg);
        const svgToExport = exportInfo ? exportInfo.svgForExport : svg;
        const blob = new Blob([svgToExport], { type: 'image/svg+xml' });
        downloadFile(blob, 'diagram.svg');
        showToast('SVG exported!');
    }, [svg, showToast]);

    const handleExportPNG = useCallback(() => {
        if (!svg) return;

        const exportInfo = getExportInfo(svg);
        if (!exportInfo) {
            showToast('Could not determine diagram dimensions for export.', 'error');
            return;
        }
        const { svgForExport, width, height } = exportInfo;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgForExport);
        
        img.onload = () => {
            canvas.width = width * 2;
            canvas.height = height * 2;
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if(blob) downloadFile(blob, 'diagram.png');
                showToast('PNG exported!');
            }, 'image/png');
        };
        img.onerror = () => {
            console.error('Error loading SVG for PNG export.');
            showToast('Failed to export PNG.', 'error');
        };
        img.src = dataUrl;
    }, [svg, showToast]);

    const handleCopyToClipboard = useCallback(async () => {
        if (!svg) return;
        const exportInfo = getExportInfo(svg);
        if (!exportInfo) {
            showToast('Could not determine diagram dimensions for copying.', 'error');
            return;
        }
        const { svgForExport, width, height } = exportInfo;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                showToast('Could not get canvas context.', 'error');
                return;
            };
            
            const img = new Image();
            const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgForExport);

            img.onload = () => {
                 canvas.width = width;
                 canvas.height = height;
                 ctx.drawImage(img, 0, 0);
                 canvas.toBlob(async (blob) => {
                     if (blob) {
                         try {
                             await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                             showToast('PNG copied to clipboard!');
                         } catch (clipError) {
                             console.error('Failed to write to clipboard:', clipError);
                             showToast('Failed to copy image. Clipboard access might be denied.', 'error');
                         }
                     } else {
                        showToast('Failed to create blob for copying.', 'error');
                     }
                 }, 'image/png');
            };
            img.onerror = () => {
                console.error('Error loading SVG for clipboard copy.');
                showToast('Failed to copy image.', 'error');
            };
            img.src = dataUrl;
        } catch (err) {
            console.error('Failed to copy image:', err);
            showToast('Failed to copy image.', 'error');
        }
    }, [svg, showToast]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (!previewRef.current) return;

        const rect = previewRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleAmount = -e.deltaY * 0.001 * transform.scale;
        const newScale = Math.max(0.1, Math.min(5, transform.scale + scaleAmount));
        const scaleRatio = newScale / transform.scale;

        const newX = mouseX - scaleRatio * (mouseX - transform.x);
        const newY = mouseY - scaleRatio * (mouseY - transform.y);

        setTransform({ scale: newScale, x: newX, y: newY });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only pan on left click
        e.preventDefault();
        setIsPanning(true);
        setStartPoint({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        e.preventDefault();
        const newX = e.clientX - startPoint.x;
        const newY = e.clientY - startPoint.y;
        setTransform(t => ({...t, x: newX, y: newY}));
    };

    const handleMouseUpOrLeave = () => setIsPanning(false);
    
    const zoomIn = () => setTransform(t => ({ ...t, scale: Math.min(t.scale + 0.2, 5) }));
    const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(t.scale - 0.2, 0.1) }));
    const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });
    
    const containerClasses = isMaximized
        ? "fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-[100] flex flex-col"
        : "bg-gray-800 rounded-lg shadow-lg flex flex-col h-full";

    return (
        <div className={containerClasses}>
            <div className={`flex-shrink-0 bg-gray-700 p-2 px-4 flex justify-between items-center ${isMaximized ? '' : 'rounded-t-lg'}`}>
                <h3 className="text-sm font-semibold text-gray-300">Preview</h3>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExportSVG} disabled={!svg}><Icon name="download" className="w-4 h-4 mr-1"/>SVG</Button>
                    <Button onClick={handleExportPNG} disabled={!svg}><Icon name="download" className="w-4 h-4 mr-1"/>PNG</Button>
                    <Button onClick={handleCopyToClipboard} disabled={!svg}><Icon name="copy" className="w-4 h-4 mr-1"/>Copy PNG</Button>
                    <div className="border-l border-gray-600 h-6 mx-1"></div>
                    <Button onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Minimize" : "Maximize"}>
                        <Icon name={isMaximized ? "minimize" : "maximize"} className="w-4 h-4"/>
                    </Button>
                </div>
            </div>
            <div 
                ref={previewRef} 
                className="relative flex-grow overflow-hidden flex items-center justify-center p-4"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                style={{ cursor: isPanning ? 'grabbing' : (svg ? 'grab' : 'default') }}
            >
                 <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg">
                    <Button onClick={zoomIn} className="!p-2" title="Zoom In"><Icon name="zoom-in" className="w-4 h-4" /></Button>
                    <Button onClick={zoomOut} className="!p-2" title="Zoom Out"><Icon name="zoom-out" className="w-4 h-4" /></Button>
                    <Button onClick={resetTransform} className="!p-2" title="Reset View"><Icon name="refresh-cw" className="w-4 h-4" /></Button>
                </div>

                <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }}>
                    {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md font-mono text-sm max-w-lg">{error}</div>}
                    {!error && svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
                    {!error && !svg && <div className="text-gray-500">Your diagram will appear here.</div>}
                </div>
            </div>
        </div>
    );
};

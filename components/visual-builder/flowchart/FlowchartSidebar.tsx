import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ThemeName, DiagramObject, ParsedDiagramObjects } from '../../../types';
import { CollapsibleObjectList } from '../shared/CollapsibleObjectList';
import { FlowchartFormattingPanel } from './FlowchartFormattingPanel';
import { formatNodeId, findLinkIndex, findNodeContext, parseLinkLine, getAllLinks, SelectedObject } from './helpers';

interface FlowchartSidebarProps {
    sidebarSize: number;
    code: string;
    onCodeChange: (newCode: string) => void;
    theme: ThemeName;
    selectedObject: SelectedObject | null;
    setSelectedObject: (obj: SelectedObject | null) => void;
    diagramObjects: ParsedDiagramObjects;
    onOpenMoveToSubgraphModal: () => void;
    onDeleteObject: () => void;
    onPendingSelection: (selection: { sourceId: string; targetId: string } | null) => void;
}

export const FlowchartSidebar: React.FC<FlowchartSidebarProps> = (props) => {
    const { 
        sidebarSize, 
        code, 
        onCodeChange, 
        theme, 
        selectedObject, 
        setSelectedObject, 
        diagramObjects, 
        onOpenMoveToSubgraphModal, 
        onDeleteObject,
        onPendingSelection
    } = props;

    const [sidebarVerticalSplit, setSidebarVerticalSplit] = useState(50);
    const [isVerticalResizing, setIsVerticalResizing] = useState(false);
    const sidebarRef = React.useRef<HTMLElement>(null);

    const isFormattable = useMemo(() => {
        return selectedObject?.type === 'node' || selectedObject?.type === 'subgraph' || selectedObject?.type === 'edge';
    }, [selectedObject]);

    const linkIndexForFormatting = useMemo(() => {
        if (selectedObject?.type === 'edge') {
            return findLinkIndex(code, selectedObject.id);
        }
        return -1;
    }, [code, selectedObject]);

    const nodeContext = useMemo(() => {
        if (selectedObject?.type === 'node') {
            return findNodeContext(code, formatNodeId(selectedObject.id));
        }
        return { isInSubgraph: false };
    }, [code, selectedObject]);
    
    const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsVerticalResizing(true);
    }, []);

    const handleSelectObject = (id: string, type: string) => {
        if (type === 'other') {
            setSelectedObject(null);
        } else {
            setSelectedObject({ id, type: type as SelectedObject['type'] });
        }
    };
    
    const handleRemoveFromSubgraph = useCallback(() => {
        if (selectedObject?.type !== 'node' || !nodeContext.isInSubgraph) return;

        const nodeId = formatNodeId(selectedObject.id);
        const lines = code.split('\n');
        
        let nodeLine = '';
        let nodeLineIndex = -1;
        
        const nodeRegex = new RegExp(`^\\s*${nodeId}\\b`);

        lines.forEach((line, index) => {
            if (nodeRegex.test(line.trim())) {
                nodeLine = line.trim();
                nodeLineIndex = index;
            }
        });

        if (nodeLineIndex !== -1) {
            lines.splice(nodeLineIndex, 1);
            
            const firstLineIsGraph = lines.length > 0 && (lines[0].trim().startsWith('graph') || lines[0].trim().startsWith('flowchart'));
            lines.splice(firstLineIsGraph ? 1 : 0, 0, `    ${nodeLine}`);

            onCodeChange(lines.join('\n'));
        }

    }, [selectedObject, nodeContext, code, onCodeChange]);
    
    const handleUpdateLink = useCallback((newLinkDef: { arrow?: string; text?: string }) => {
        if (!selectedObject || selectedObject.type !== 'edge') return;
        
        const linkIndex = findLinkIndex(code, selectedObject.id);
        if (linkIndex === -1) return;
        
        const allLinks = getAllLinks(code);
        const linkToUpdate = allLinks[linkIndex];
        const { line: trimmedLine, lineIndex: idx } = linkToUpdate;
        const lines = code.split('\n');
        const originalLine = lines[idx];

        const { arrow: oldArrow, text: oldText } = parseLinkLine(trimmedLine);
        
        const newArrow = newLinkDef.arrow ?? oldArrow;
        const newText = newLinkDef.text ?? oldText;

        const buildLinkPart = (arrow: string, text: string): string => {
            if (text) {
                return ` -- "${text}" -->`;
            }
            return ` ${arrow} `;
        };

        const oldLinkPart = buildLinkPart(oldArrow, oldText);
        const newLinkPart = buildLinkPart(newArrow, newText);
        
        const sourcePart = originalLine.substring(0, originalLine.indexOf(oldLinkPart));
        const targetPart = originalLine.substring(originalLine.indexOf(oldLinkPart) + oldLinkPart.length);

        const newLine = `${sourcePart}${newLinkPart}${targetPart}`;
        
        lines[idx] = newLine;
        onCodeChange(lines.join('\n'));

    }, [code, onCodeChange, selectedObject]);

    const handleSwapLinkDirection = useCallback(() => {
        if (!selectedObject || selectedObject.type !== 'edge') return;
        const linkIndex = findLinkIndex(code, selectedObject.id);
        if (linkIndex === -1) return;

        const allLinks = getAllLinks(code);
        const linkToUpdate = allLinks[linkIndex];
        const { source, target, lineIndex } = linkToUpdate;
        
        const lines = code.split('\n');
        const originalLine = lines[lineIndex];
        
        const linkPartsRegex = new RegExp(`(^[\\s\\w\\d.-]+(?:\\s*\\[[^\\]]*\\]|\\s*\\([^\\)]*\\)|\\s*\\{[^\\}]*\\})?)(\\s*.*\\s*)(${target})`);
        
        const match = originalLine.trim().match(linkPartsRegex);
        if(match && match.length > 3) {
            const sourcePart = originalLine.substring(0, originalLine.indexOf(source));
            const middlePart = match[2];
            const targetPart = originalLine.substring(originalLine.indexOf(target) + target.length);

            const newLine = `${sourcePart.replace(source, target)}${middlePart}${source}${targetPart}`;
            lines[lineIndex] = newLine;
            onCodeChange(lines.join('\n'));
            onPendingSelection({ sourceId: target, targetId: source });
        } else {
             const newLine = originalLine.replace(source, '__TEMP__').replace(target, source).replace('__TEMP__', target);
             lines[lineIndex] = newLine;
             onCodeChange(lines.join('\n'));
             onPendingSelection({ sourceId: target, targetId: source });
        }
    }, [code, onCodeChange, selectedObject, onPendingSelection]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isVerticalResizing && sidebarRef.current) {
                const sidebarRect = sidebarRef.current.getBoundingClientRect();
                const newHeight = e.clientY - sidebarRect.top;
                const newSize = (newHeight / sidebarRect.height) * 100;
                setSidebarVerticalSplit(Math.max(20, Math.min(80, newSize)));
            }
        };
        const handleMouseUp = () => setIsVerticalResizing(false);

        if (isVerticalResizing) {
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'row-resize';
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
    }, [isVerticalResizing]);

    return (
        <aside 
            ref={sidebarRef}
            className="bg-gray-800 rounded-lg flex flex-col"
            style={{ width: `${sidebarSize}%` }}
        >
            <div
                className="p-4 overflow-y-auto"
                style={{ height: isFormattable && selectedObject ? `${sidebarVerticalSplit}%` : '100%', flexShrink: 1, minHeight: 0 }}
            >
                <h3 className="text-base font-semibold text-white mb-4">Diagram Objects</h3>
                <CollapsibleObjectList title="Subgraphs" objects={diagramObjects.subgraphs} icon="folder" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="subgraph" showId={true} />
                <CollapsibleObjectList title="Nodes" objects={diagramObjects.nodes} icon="square" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="node" showId={true} idFormatter={formatNodeId} />
                <CollapsibleObjectList title="Links" objects={diagramObjects.edges} icon="link" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="edge" />
                <CollapsibleObjectList title="Others" objects={diagramObjects.others} icon="git-commit" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="other" defaultOpen={false} />
            </div>
            
            {isFormattable && selectedObject && (
                <>
                    <div
                        onMouseDown={handleVerticalMouseDown}
                        className="w-full h-2 flex-shrink-0 cursor-row-resize bg-gray-700 hover:bg-indigo-500 transition-colors"
                        aria-label="Resize formatting panel"
                    />
                    <div
                         className="overflow-y-auto"
                         style={{ height: `calc(100% - ${sidebarVerticalSplit}% - 8px)`, flexShrink: 1, minHeight: 0 }}
                    >
                        <FlowchartFormattingPanel
                            selectedObject={selectedObject}
                            linkIndex={linkIndexForFormatting}
                            onClose={() => setSelectedObject(null)}
                            code={code}
                            onCodeChange={onCodeChange}
                            theme={theme}
                            subgraphs={diagramObjects.subgraphs}
                            onOpenMoveToSubgraphModal={onOpenMoveToSubgraphModal}
                            isInSubgraph={nodeContext.isInSubgraph}
                            onRemoveFromSubgraph={handleRemoveFromSubgraph}
                            onDeleteObject={onDeleteObject}
                            onUpdateLink={handleUpdateLink}
                            onSwapLinkDirection={handleSwapLinkDirection}
                        />
                    </div>
                </>
            )}
        </aside>
    );
};
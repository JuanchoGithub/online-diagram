import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ThemeName, DiagramObject } from '../../types';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { ShapesPalette } from '../ShapesPalette';
import type { Shape } from '../shapesData';
import { MoveToSubgraphModal } from '../MoveToSubgraphModal';
// FIX: Import getAllLinks and parseLinkLine to break circular dependency and remove 'require'.
import { FormattingPanel, getAllLinks, parseLinkLine } from '../FormattingPanel';

interface VisualBuilderViewProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    theme: ThemeName;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface SelectedObject {
    id: string;
    type: 'node' | 'subgraph' | 'edge';
}

interface ParsedDiagramObjects {
    nodes: DiagramObject[];
    edges: DiagramObject[];
    subgraphs: DiagramObject[];
    others: DiagramObject[];
}

const formatNodeId = (id: string): string => {
    const parts = id.split('-');
    if (parts.length >= 3 && !isNaN(parseInt(parts[parts.length - 1], 10))) {
        return parts.slice(1, parts.length - 1).join('-');
    }
    return id;
};

// FIX: Moved getAllLinks to FormattingPanel.tsx to resolve circular dependency.

const findLinkIndex = (code: string, selectedEdgeId: string): number => {
    if (!selectedEdgeId.startsWith('L_')) return -1;
    const edgeParts = selectedEdgeId.substring(2).split('_');
    if (edgeParts.length < 2) return -1;
    
    const sourceId = edgeParts.shift()!;
    const localIndexStr = edgeParts.pop()!;
    const localIndex = parseInt(localIndexStr, 10);
    const targetId = edgeParts.join('_');

    if (isNaN(localIndex)) return -1;
    
    const allLinks = getAllLinks(code);
    const matchingSourceTargetLinks = allLinks.filter(link => link.source === sourceId && link.target === targetId);
    
    if (localIndex >= matchingSourceTargetLinks.length) return -1;
    
    const targetLinkLine = matchingSourceTargetLinks[localIndex];

    return allLinks.findIndex(line => line.lineIndex === targetLinkLine.lineIndex);
};

const findNodeContext = (code: string, nodeId: string): { isInSubgraph: boolean } => {
    const lines = code.split('\n');
    let subgraphDepth = 0;
    
    const nodeRegex = new RegExp(`^\\s*${nodeId}\\b`);

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('subgraph ')) {
            subgraphDepth++;
        } else if (trimmed === 'end') {
            subgraphDepth = Math.max(0, subgraphDepth - 1);
        } else if (nodeRegex.test(trimmed)) {
            return { isInSubgraph: subgraphDepth > 0 };
        }
    }

    return { isInSubgraph: false };
};

const parseSvgForObjects = (svgContainer: HTMLDivElement | null): ParsedDiagramObjects => {
    if (!svgContainer) return { nodes: [], edges: [], subgraphs: [], others: [] };

    const nodes: DiagramObject[] = [];
    const edges: DiagramObject[] = [];
    const subgraphs: DiagramObject[] = [];
    const others: DiagramObject[] = [];
    const processedIds = new Set<string>();
    const nodeLabelMap = new Map<string, string>();

    const getGenericLabel = (element: Element, defaultId: string): string => {
        const textEl = element.querySelector('.label text, .label div, :scope > text, :scope > div, .subgraph-title, .nodeLabel');
        return textEl?.textContent?.trim() || defaultId;
    };

    svgContainer.querySelectorAll('g.node').forEach(el => {
        const element = el as HTMLElement;
        const id = element.id;
        if (!id) return;
        const coreId = formatNodeId(id);
        const label = getGenericLabel(element, coreId);
        if (label !== coreId) {
            nodeLabelMap.set(coreId, label);
        }
    });

    svgContainer.querySelectorAll('[id]').forEach(el => {
        const element = el as HTMLElement;
        const id = element.id;
        if (!id || processedIds.has(id)) return;

        let categorized = false;

        if (element.tagName.toLowerCase() === 'g') {
            if (element.matches('.subgraph, .cluster')) {
                subgraphs.push({ id, label: getGenericLabel(element, id) });
                categorized = true;
            } else if (element.matches('.node')) {
                nodes.push({ id, label: getGenericLabel(element, id) });
                categorized = true;
            } else if (element.matches('.actor, .participant, .class')) {
                others.push({ id, label: getGenericLabel(element, id) });
                categorized = true;
            }
        }

        if (!categorized && id.startsWith('L_')) {
            const parts = id.split('_');
            if (parts.length >= 3) {
                const labelId = `edgeLabel_${id}`;
                const labelGroup = svgContainer.querySelector(`#${CSS.escape(labelId)}`);
                const edgeText = labelGroup?.textContent?.trim();

                const sourceId = parts[1];
                let targetParts = parts.slice(2);
                if (targetParts.length > 1 && /^\d+$/.test(targetParts[targetParts.length - 1])) {
                    targetParts.pop();
                }
                const targetId = targetParts.join('_');
                
                const sourceLabel = nodeLabelMap.get(sourceId) || sourceId;
                const targetLabel = nodeLabelMap.get(targetId) || targetId;
                
                let displayLabel = `${sourceLabel} -> ${targetLabel}`;
                if (edgeText) {
                   displayLabel = `${sourceLabel} -- "${edgeText}" --> ${targetLabel}`;
                }
                // FIX: Added sourceId and targetId to edge DiagramObject. The type was updated in types.ts
                edges.push({ id, label: displayLabel, sourceId, targetId });
            }
            categorized = true;
        }
        
        if (!categorized) {
             const label = getGenericLabel(element, id) || id;
             const isPathInsideEdge = el.matches('g.edgePath path, g.edgeLabel text');
             if(!isPathInsideEdge) {
                others.push({ id, label });
             }
        }
        processedIds.add(id);
    });

    return { nodes, edges, subgraphs, others };
};

const CollapsibleObjectList: React.FC<{
    title: string;
    objects: DiagramObject[];
    icon: string;
    selectedId: string | null;
    onSelect: (id: string, type: 'node' | 'subgraph' | 'edge' | 'other') => void;
    type: 'node' | 'subgraph' | 'edge' | 'other';
    showId?: boolean;
    idFormatter?: (id: string) => string;
    defaultOpen?: boolean;
}> = ({ title, objects, icon, selectedId, onSelect, type, showId = false, idFormatter = (id) => id, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                className="w-full flex justify-between items-center text-sm font-semibold text-gray-400 mb-2 mt-4 px-2 hover:text-white transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} className="w-4 h-4" />
                    <span>{title} ({objects.length})</span>
                </div>
            </button>
            {isOpen && (
                <ul className="space-y-1">
                    {objects.length > 0 ? (
                        objects.map(obj => (
                            <li key={obj.id}>
                                <button
                                    onClick={() => onSelect(obj.id, type)}
                                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-3 ${
                                        selectedId === obj.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                                    title={obj.label}
                                >
                                    <Icon name={icon} className="w-4 h-4 flex-shrink-0" />
                                    <div className="flex-grow min-w-0 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'thin' }}>
                                        <span>{obj.label}</span>
                                        {showId && (
                                            <span className="text-gray-400 font-mono text-xs ml-2">
                                                ({idFormatter(obj.id)})
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))
                    ) : (
                         <li>
                            <p className="px-3 py-1.5 text-sm text-gray-500 italic">None</p>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

const TooltipButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    iconName: string;
    tooltipText: string;
}> = ({ iconName, tooltipText, className, ...props }) => (
    <div className="relative group">
        <Button {...props} className={`!p-2 ${className || ''}`}>
            <Icon name={iconName} className="w-5 h-5" />
        </Button>
        <div
            className="absolute top-full mt-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-75 pointer-events-none z-10"
            style={{ transitionDelay: '100ms', left: '50%', transform: 'translateX(-50%)' }}
            role="tooltip"
        >
            {tooltipText}
        </div>
    </div>
);

export const VisualBuilderView: React.FC<VisualBuilderViewProps> = ({ code, onCodeChange, theme, showToast }) => {
    const [svgContent, setSvgContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [diagramObjects, setDiagramObjects] = useState<ParsedDiagramObjects>({ nodes: [], edges: [], subgraphs: [], others: [] });
    const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
    const [isShapesPaletteOpen, setIsShapesPaletteOpen] = useState(false);
    const [isMoveToSubgraphModalOpen, setIsMoveToSubgraphModalOpen] = useState(false);
    const [linkingTargetId, setLinkingTargetId] = useState<string | null>(null);
    const [linkingState, setLinkingState] = useState<{
        startNodeId: string | null;
        startPoint: { x: number; y: number } | null;
        endPoint: { x: number; y: number } | null;
    }>({ startNodeId: null, startPoint: null, endPoint: null });
    const [sidebarSize, setSidebarSize] = useState(25); 
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarVerticalSplit, setSidebarVerticalSplit] = useState(50);
    const [isVerticalResizing, setIsVerticalResizing] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<{ sourceId: string; targetId: string } | null>(null);
    
    const [isPanMode, setIsPanMode] = useState(false);
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    const nodeCounterRef = useRef(1);
    const subgraphCounterRef = useRef(1);
    const dragStartPointRef = useRef<{ x: number; y: number; target: HTMLElement | null } | null>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const mermaidId = 'visual-builder-preview';
    
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

    const handleMouseDownOnDivider = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);
    
    const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsVerticalResizing(true);
    }, []);

    const handleSelectObject = (id: string, type: SelectedObject['type'] | 'other') => {
        if (type === 'other') {
            setSelectedObject(null);
        } else {
            setSelectedObject({ id, type });
        }
    };

    const handleDeleteSelectedObject = useCallback(() => {
        if (!selectedObject) return;

        const { id, type } = selectedObject;
        let lines = code.split('\n');
        let finalCode = code;

        if (type === 'node') {
            const nodeId = formatNodeId(id);
            const newLines = lines.map(line => {
                const trimmed = line.trim();
                const indentation = line.match(/^\s*/)?.[0] || '';

                // Define patterns for the node itself, other nodes, and link arrows
                const selfNodePattern = `${nodeId}\\b(?:(?:\\[[^\\]]*\\])|(?:\\([^\\)]*\\))|(?:\\{[^\\}]*\\})|(?:@\\{[^\\}]*\\}))?`;
                const otherNodePattern = `([\\w\\d.-]+\\b(?:(?:\\[[^\\]]*\\])|(?:\\([^\\)]*\\))|(?:\\{[^\\}]*\\})|(?:@\\{[^\\}]*\\}))?)`;
                const linkArrowPattern = `\\s*?(?:--(?:"[^"]*")?-->|-->|---|--\\.|==>|<-->|--o|o--o|--x|x--x|~~~)\\s*?`;

                // Pattern for a standalone definition of the node to be deleted
                const standaloneDefRegex = new RegExp(`^${selfNodePattern}\\s*;?\\s*$`);
                if (standaloneDefRegex.test(trimmed)) {
                    return null; // Mark line for deletion
                }

                // Pattern for a style definition of the node to be deleted
                const styleRegex = new RegExp(`^\\s*(style|class)\\s+${nodeId}\\b`);
                if (styleRegex.test(trimmed)) {
                    return null; // Mark line for deletion
                }

                // Pattern for a link where the node is the target (e.g., C --> A)
                const targetLinkRegex = new RegExp(`^${otherNodePattern}${linkArrowPattern}${selfNodePattern}\\s*;?\\s*$`);
                const targetMatch = trimmed.match(targetLinkRegex);
                if (targetMatch) {
                     // Preserve the source node, but remove the link and the target node
                    return `${indentation}${targetMatch[1]}`;
                }

                // Pattern for a link where the node is the source (e.g., A --> B)
                const sourceLinkRegex = new RegExp(`^${selfNodePattern}${linkArrowPattern}${otherNodePattern}\\s*;?\\s*$`);
                const sourceMatch = trimmed.match(sourceLinkRegex);
                if (sourceMatch) {
                    // Preserve the target node, but remove the source node and the link
                    return `${indentation}${sourceMatch[1]}`;
                }

                // If no patterns match, keep the line as is
                return line;
            }).filter(line => line !== null) as string[];

            finalCode = newLines.join('\n');

        } else if (type === 'edge') {
            const linkIndex = findLinkIndex(finalCode, id);
            if (linkIndex !== -1) {
                const linkToDel = getAllLinks(finalCode)[linkIndex];
                lines = lines.filter((line, index) => index !== linkToDel.lineIndex);
                finalCode = lines.join('\n');
            }
        } else if (type === 'subgraph') {
             let startIndex = -1;
             const subgraphRegex = new RegExp(`^(\\s*)subgraph\\s+${id}\\b`);
             for (let i = 0; i < lines.length; i++) {
                 if (subgraphRegex.test(lines[i])) {
                     startIndex = i;
                     break;
                 }
             }

             if (startIndex !== -1) {
                 let depth = 1;
                 let endIndex = -1;
                 for (let i = startIndex + 1; i < lines.length; i++) {
                     const trimmed = lines[i].trim();
                     if (trimmed.startsWith('subgraph ')) depth++;
                     if (trimmed === 'end') depth--;
                     if (depth === 0) {
                         endIndex = i;
                         break;
                     }
                 }
                 if (endIndex !== -1) {
                    lines.splice(startIndex, endIndex - startIndex + 1);
                    finalCode = lines.join('\n');
                 }
             }
        }

        onCodeChange(finalCode.replace(/\n\n+/g, '\n').trim());
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`, 'success');
        setSelectedObject(null);
    }, [selectedObject, code, onCodeChange, showToast]);
    
    const handleDuplicateSelectedObject = useCallback(() => {
        if (!selectedObject || selectedObject.type === 'edge') return;
        
        const { id, type } = selectedObject;
        let lines = code.split('\n');
        let finalCode = code;

        if (type === 'node') {
            const nodeId = formatNodeId(id);
            const newId = `${nodeId}_${Math.floor(Math.random() * 100)}`;
            
            const nodeDefRegex = new RegExp(`^(\\s*)(${nodeId})(\\[.*|\(.*\)|\\{.*|@\\{.*)?`);
            const defLineIndex = lines.findIndex(l => nodeDefRegex.test(l.trim()));
            
            if (defLineIndex !== -1) {
                const originalLine = lines[defLineIndex];
                const newLine = originalLine.replace(nodeId, newId);
                lines.splice(defLineIndex + 1, 0, newLine);

                const newStyleLines: string[] = [];
                lines.forEach(line => {
                    const styleRegex = new RegExp(`^(\\s*style\\s+)${nodeId}(\\s+.*)`);
                    if (styleRegex.test(line)) {
                        newStyleLines.push(line.replace(styleRegex, `$1${newId}$2`));
                    }
                    const classRegex = new RegExp(`^(\\s*class\\s+)${nodeId}(\\s+.*)`);
                     if (classRegex.test(line)) {
                        newStyleLines.push(line.replace(classRegex, `$1${newId}$2`));
                    }
                });
                lines.push(...newStyleLines);
                finalCode = lines.join('\n');
            }

        } else if (type === 'subgraph') {
             let startIndex = -1;
             const subgraphRegex = new RegExp(`^(\\s*)subgraph\\s+(?:${id}|\"${id}\"|${id}\\[.*?\\])\\b`);
             for (let i = 0; i < lines.length; i++) {
                 if (subgraphRegex.test(lines[i])) {
                     startIndex = i;
                     break;
                 }
             }
             if (startIndex !== -1) {
                 let depth = 1;
                 let endIndex = -1;
                 for (let i = startIndex + 1; i < lines.length; i++) {
                     if (lines[i].trim().startsWith('subgraph ')) depth++;
                     if (lines[i].trim() === 'end') depth--;
                     if (depth === 0) {
                         endIndex = i;
                         break;
                     }
                 }
                 if (endIndex !== -1) {
                     const block = lines.slice(startIndex, endIndex + 1);
                     const idMap: Record<string, string> = {};
                     const suffix = `_copy`;
                     const newSubgraphId = `${id}${suffix}`;
                     idMap[id] = newSubgraphId;
                     
                     const newBlock = block.map(line => {
                        let newLine = line;
                        const nodeMatch = line.match(/^\s*([\w\d.-]+)/);
                        if (nodeMatch) {
                            const oldNodeId = nodeMatch[1];
                            if (!idMap[oldNodeId] && oldNodeId !== 'subgraph' && oldNodeId !== 'end' && oldNodeId !== 'direction' && !line.trim().startsWith('linkStyle') && !line.trim().startsWith('classDef')) {
                               idMap[oldNodeId] = `${oldNodeId}${suffix}`;
                            }
                        }

                        Object.entries(idMap).forEach(([oldId, newId]) => {
                             newLine = newLine.replace(new RegExp(`\\b${oldId}\\b`, 'g'), newId);
                        });
                        return newLine;
                     });
                     lines.splice(endIndex + 1, 0, '', ...newBlock);
                     finalCode = lines.join('\n');
                 }
             }
        }

        onCodeChange(finalCode);
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} duplicated.`, 'success');
    }, [selectedObject, code, onCodeChange, showToast]);

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
            // FIX: The second argument to splice must be a number (the delete count), not a string. To insert, delete count should be 0.
            lines.splice(firstLineIsGraph ? 1 : 0, 0, `    ${nodeLine}`);

            onCodeChange(lines.join('\n'));
            showToast('Node removed from subgraph.', 'success');
        }

    }, [selectedObject, nodeContext, code, onCodeChange, showToast]);
    
    const handleMoveToSubgraph = useCallback((targetSubgraph: DiagramObject) => {
        if (!selectedObject || selectedObject.type !== 'node') {
            showToast("No node selected.", 'error');
            return;
        }
        const nodeId = formatNodeId(selectedObject.id);
        const lines = code.split('\n');
        
        let nodeLineContent = '';
        let nodeLineIndex = -1;
        const nodeRegex = new RegExp(`^\\s*${nodeId}\\b`);
        
        const lineIdx = lines.findIndex(l => nodeRegex.test(l.trim()));
        if(lineIdx !== -1) {
            nodeLineContent = lines[lineIdx].trim();
            nodeLineIndex = lineIdx;
        }

        if (nodeLineIndex === -1) return;
        lines.splice(nodeLineIndex, 1);
        
        const subgraphCodeId = formatNodeId(targetSubgraph.id);
        const subgraphRegex = new RegExp(`^(\\s*)subgraph\\s+(?:${subgraphCodeId}|\"${subgraphCodeId}\"|${subgraphCodeId}\\[.*?\\])\\b`);
        const targetSubgraphStartIndex = lines.findIndex(l => subgraphRegex.test(l));
        if (targetSubgraphStartIndex === -1) return;
        
        let depth = 1;
        let subgraphEndIndex = -1;
        for (let i = targetSubgraphStartIndex + 1; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('subgraph')) depth++;
            if (trimmed === 'end') {
                depth--;
                if (depth === 0) {
                    subgraphEndIndex = i;
                    break;
                }
            }
        }
        if (subgraphEndIndex === -1) return;
        
        const indentation = (lines[targetSubgraphStartIndex].match(subgraphRegex) || [])[1] || '';
        lines.splice(subgraphEndIndex, 0, `${indentation}  ${nodeLineContent}`);
        
        onCodeChange(lines.join('\n'));
        showToast(`Moved node to subgraph "${targetSubgraph.label}".`, 'success');
        setSelectedObject(null);
    }, [code, onCodeChange, selectedObject, showToast]);

    const buildLinkPart = (arrow: string, text: string): string => {
        if (text) {
            return ` -- "${text}" -->`;
        }
        return ` ${arrow} `;
    };

    const handleUpdateLink = useCallback((newLinkDef: { arrow?: string; text?: string }) => {
        if (!selectedObject || selectedObject.type !== 'edge') return;
        
        const linkIndex = findLinkIndex(code, selectedObject.id);
        if (linkIndex === -1) return;
        
        const allLinks = getAllLinks(code);
        const linkToUpdate = allLinks[linkIndex];
        const { line: trimmedLine, lineIndex } = linkToUpdate;
        const lines = code.split('\n');
        const originalLine = lines[lineIndex];

        const { arrow: oldArrow, text: oldText } = parseLinkLine(trimmedLine);
        
        const newArrow = newLinkDef.arrow ?? oldArrow;
        const newText = newLinkDef.text ?? oldText;

        const oldLinkPart = buildLinkPart(oldArrow, oldText);
        const newLinkPart = buildLinkPart(newArrow, newText);
        
        // This is a simple but fragile replacement. A more robust solution would be a proper parser.
        const sourcePart = originalLine.substring(0, originalLine.indexOf(oldLinkPart));
        const targetPart = originalLine.substring(originalLine.indexOf(oldLinkPart) + oldLinkPart.length);

        const newLine = `${sourcePart}${newLinkPart}${targetPart}`;
        
        lines[lineIndex] = newLine;
        onCodeChange(lines.join('\n'));

    }, [code, onCodeChange, selectedObject]);

    const handleSwapLinkDirection = useCallback(() => {
        if (!selectedObject || selectedObject.type !== 'edge') return;
        const linkIndex = findLinkIndex(code, selectedObject.id);
        if (linkIndex === -1) return;

        const allLinks = getAllLinks(code);
        const linkToUpdate = allLinks[linkIndex];
        const { source, target, line, lineIndex } = linkToUpdate;
        
        const lines = code.split('\n');
        const originalLine = lines[lineIndex];
        
        // This is a simple regex swap, it might not cover all edge cases
        const linkPartsRegex = new RegExp(`(^[\\s\\w\\d.-]+(?:\\s*\\[[^\\]]*\\]|\\s*\\([^\\)]*\\)|\\s*\\{[^\\}]*\\})?)(\\s*.*\\s*)(${target})`);
        
        const match = originalLine.trim().match(linkPartsRegex);
        if(match && match.length > 3) {
            const sourcePart = originalLine.substring(0, originalLine.indexOf(source));
            const middlePart = match[2];
            const targetPart = originalLine.substring(originalLine.indexOf(target) + target.length);

            const newLine = `${sourcePart.replace(source, target)}${middlePart}${source}${targetPart}`;
            lines[lineIndex] = newLine;
            onCodeChange(lines.join('\n'));
            showToast('Link direction swapped.', 'success');
            setPendingSelection({ sourceId: target, targetId: source });
        } else {
             const newLine = originalLine.replace(source, '__TEMP__').replace(target, source).replace('__TEMP__', target);
             lines[lineIndex] = newLine;
             onCodeChange(lines.join('\n'));
             showToast('Link direction swapped.', 'success');
             setPendingSelection({ sourceId: target, targetId: source });
        }
    }, [code, onCodeChange, selectedObject]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'v' && e.target && !['TEXTAREA', 'INPUT', 'SELECT'].includes((e.target as HTMLElement).nodeName)) {
                e.preventDefault();
                setIsPanMode(prev => !prev);
            }
             if (e.key === 'Escape') {
                setSelectedObject(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const newSidebarWidth = containerRect.right - e.clientX;
                const newSize = (newSidebarWidth / containerRect.width) * 100;
                setSidebarSize(Math.max(15, Math.min(50, newSize)));
            }
        };
        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
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
    }, [isResizing]);

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

    useEffect(() => {
        const renderMermaid = async () => {
            if (!code.trim()) {
                setSvgContent('');
                setError(null);
                setDiagramObjects({ nodes: [], edges: [], subgraphs: [], others: [] });
                return;
            }
            try {
                setError(null);
                const { svg } = await (window as any).mermaid.render(mermaidId, code);
                setSvgContent(svg);
            } catch (e: any) {
                const errorMessage = e.message || 'Invalid Mermaid syntax.';
                setError(errorMessage);
                showToast(errorMessage, 'error');
                setSvgContent('');
                setDiagramObjects({ nodes: [], edges: [], subgraphs: [], others: [] });
            }
        };
        const timeoutId = setTimeout(renderMermaid, 300);
        return () => clearTimeout(timeoutId);
    }, [code, theme, showToast]);
    
    useEffect(() => {
        if (svgContent && svgContainerRef.current) {
            const timer = setTimeout(() => {
                if (svgContainerRef.current) {
                    const objects = parseSvgForObjects(svgContainerRef.current);
                    setDiagramObjects(objects);

                    if (pendingSelection) {
                        // FIX: Added optional chaining and checks since sourceId/targetId are optional.
                        const newLink = objects.edges.find(e => e.sourceId === pendingSelection.sourceId && e.targetId === pendingSelection.targetId);
                        if (newLink) {
                            setSelectedObject({ id: newLink.id, type: 'edge' });
                        }
                        setPendingSelection(null);
                    }
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [svgContent, pendingSelection]);

    useEffect(() => {
        if (!svgContainerRef.current) return;

        const previouslySelected = svgContainerRef.current.querySelectorAll('.selected-object');
        previouslySelected.forEach(el => el.classList.remove('selected-object'));
        
        if (selectedObject) {
            const elementToSelect = svgContainerRef.current.querySelector(`#${CSS.escape(selectedObject.id)}`);
            if (elementToSelect) {
                elementToSelect.classList.add('selected-object');
            }

            if (selectedObject.id.startsWith('L_')) {
                 const labelId = `edgeLabel_${selectedObject.id}`;
                 const labelElement = svgContainerRef.current.querySelector(`#${CSS.escape(labelId)}`);
                 if (labelElement) labelElement.classList.add('selected-object');
            }
        }
    }, [selectedObject, svgContent]);

    useEffect(() => {
        if (!svgContainerRef.current) return;
        const previousTarget = svgContainerRef.current.querySelector('.linking-target');
        if (previousTarget) {
            previousTarget.classList.remove('linking-target');
        }
        if (linkingTargetId) {
            const newTarget = svgContainerRef.current.querySelector(`#${CSS.escape(linkingTargetId)}`);
            if (newTarget) {
                newTarget.classList.add('linking-target');
            }
        }
    }, [linkingTargetId, svgContent]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanMode) {
            if (e.button !== 0) return;
            e.preventDefault();
            setIsPanning(true);
            setStartPoint({ x: e.clientX - transform.x, y: e.clientY - transform.y });
            return;
        }

        dragStartPointRef.current = { x: e.clientX, y: e.clientY, target: e.target as HTMLElement };

        const parentGroup = (e.target as HTMLElement).closest('g.subgraph, g.cluster, g.node');
        if (parentGroup && parentGroup.id) {
            e.preventDefault();
            const containerRect = e.currentTarget.getBoundingClientRect();
            const nodeRect = parentGroup.getBoundingClientRect();
            const startPoint = {
                x: nodeRect.left + nodeRect.width / 2 - containerRect.left,
                y: nodeRect.top + nodeRect.height / 2 - containerRect.top,
            };

            setLinkingState({
                startNodeId: parentGroup.id,
                startPoint: startPoint,
                endPoint: startPoint,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanMode) {
            if (!isPanning) return;
            e.preventDefault();
            const newX = e.clientX - startPoint.x;
            const newY = e.clientY - startPoint.y;
            setTransform(t => ({...t, x: newX, y: newY}));
            return;
        }

        if (!linkingState.startNodeId) return;

        const containerRect = e.currentTarget.getBoundingClientRect();
        const endPoint = { 
            x: e.clientX - containerRect.left, 
            y: e.clientY - containerRect.top 
        };
        setLinkingState(prev => (prev.startNodeId ? { ...prev, endPoint } : prev));

        const endGroup = (e.target as HTMLElement).closest('g.subgraph, g.cluster, g.node');
        if (endGroup && endGroup.id && endGroup.id !== linkingState.startNodeId) {
            setLinkingTargetId(endGroup.id);
        } else {
            setLinkingTargetId(null);
        }
    };
    
    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanMode) {
            setIsPanning(false);
            return;
        }
        
        if (!dragStartPointRef.current) return;

        const dragDistance = Math.sqrt(
            Math.pow(e.clientX - dragStartPointRef.current.x, 2) +
            Math.pow(e.clientY - dragStartPointRef.current.y, 2)
        );

        if (dragDistance > 5 && linkingState.startNodeId) {
            const endGroup = (e.target as HTMLElement).closest('g.subgraph, g.cluster, g.node');
            if (endGroup && endGroup.id && endGroup.id !== linkingState.startNodeId) {
                const startId = formatNodeId(linkingState.startNodeId);
                const endId = formatNodeId(endGroup.id);

                if (startId && endId) {
                    const updatedCode = `${code.trim()}\n  ${startId} --> ${endId}`;
                    onCodeChange(updatedCode);
                    showToast(`Linked ${startId} to ${endId}`, 'success');
                }
            }
        } else {
            const target = dragStartPointRef.current.target;
            if (target) {
                const findAndSetSelected = (el: HTMLElement | null) => {
                     const edgePath = el?.closest('g.edgePath, g.edgeLabel');
                     if(edgePath) {
                        const parentG = edgePath.closest('g.edge');
                         if(parentG && parentG.id) {
                            setSelectedObject({id: parentG.id, type: 'edge'});
                            return true;
                         }
                     }
                     const parentGroup = el?.closest('g.subgraph, g.cluster, g.node, g.actor, g.participant, g.class');
                     if (parentGroup && parentGroup.id) {
                        const isNode = diagramObjects.nodes.some(o => o.id === parentGroup.id);
                        const isSubgraph = diagramObjects.subgraphs.some(o => o.id === parentGroup.id);
                        if(isNode) setSelectedObject({id: parentGroup.id, type: 'node'});
                        else if(isSubgraph) setSelectedObject({id: parentGroup.id, type: 'subgraph'});
                        else setSelectedObject(null);
                        return true;
                     }
                     return false;
                }
                
                if (!findAndSetSelected(target)) {
                    setSelectedObject(null);
                }
            }
        }

        dragStartPointRef.current = null;
        setLinkingState({ startNodeId: null, startPoint: null, endPoint: null });
        setLinkingTargetId(null);
    };
    
    const handleMouseLeave = () => {
        if (isPanMode) {
            setIsPanning(false);
        }
        if (linkingState.startNodeId) {
            setLinkingState({ startNodeId: null, startPoint: null, endPoint: null });
            setLinkingTargetId(null);
        }
    };
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (!svgContainerRef.current) return;

        const rect = svgContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleAmount = -e.deltaY * 0.001 * transform.scale;
        const newScale = Math.max(0.1, Math.min(5, transform.scale + scaleAmount));
        const scaleRatio = newScale / transform.scale;

        const newX = mouseX - scaleRatio * (mouseX - transform.x);
        const newY = mouseY - scaleRatio * (mouseY - transform.y);

        setTransform({ scale: newScale, x: newX, y: newY });
    };

    const zoomIn = () => setTransform(t => ({ ...t, scale: Math.min(t.scale + 0.2, 5) }));
    const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(t.scale - 0.2, 0.1) }));
    const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });

    const handleAddShape = (shape: Shape) => {
        const newNodeId = `node${nodeCounterRef.current++}`;
        const nodeLabel = `"${shape.name}"`;

        let newNodeCode = shape.type === 'classic' 
            ? `${newNodeId}${shape.syntax.replace('Text', nodeLabel)}`
            : `${newNodeId}@{ shape: ${shape.syntax}, label: ${nodeLabel} }`;

        let updatedCode = code.trim();
        const diagramType = updatedCode.split('\n')[0]?.trim();

        if (!diagramType || (!diagramType.startsWith('graph') && !diagramType.startsWith('flowchart'))) {
            updatedCode = `flowchart TD\n  ${newNodeCode}`;
        } else {
            updatedCode = `${updatedCode}\n  ${newNodeCode}`;
        }
        
        onCodeChange(updatedCode);
        setIsShapesPaletteOpen(false);
        showToast(`Added ${shape.name} node.`, 'success');
    };
    
    const handleAddSubgraph = useCallback(() => {
        const subgraphId = `subgraph${subgraphCounterRef.current++}`;
        const newNodeId = `node${nodeCounterRef.current++}`;
        const newSubgraphCode = `subgraph ${subgraphId}["New Subgraph"]\n  ${newNodeId}["Untitled Node"]\nend`;

        let updatedCode = code.trim();
        const diagramType = updatedCode.split('\n')[0]?.trim();

        if (!diagramType || (!diagramType.startsWith('graph') && !diagramType.startsWith('flowchart'))) {
            updatedCode = `flowchart TD\n${newSubgraphCode}`;
        } else {
            updatedCode = `${updatedCode}\n\n${newSubgraphCode}`;
        }
        
        onCodeChange(updatedCode);
        showToast(`Added new subgraph with a default node.`, 'success');
    }, [code, onCodeChange, showToast]);

    return (
        <div ref={containerRef} className="flex h-[calc(100vh-6.5rem)]">
            <main 
                className="bg-gray-800 rounded-lg shadow-lg flex flex-col relative overflow-hidden"
                style={{ width: `calc(100% - ${sidebarSize}% - 8px)` }}
            >
                 <div className="flex-shrink-0 bg-gray-700 p-2 px-4 flex justify-between items-center rounded-t-lg">
                    <h3 className="text-sm font-semibold text-gray-300">Canvas</h3>
                    <div className="flex items-center gap-2">
                         {(selectedObject?.type === 'node' || selectedObject?.type === 'subgraph') && (
                            <>
                                <TooltipButton
                                    onClick={handleDuplicateSelectedObject}
                                    aria-label="Duplicate Selected Object"
                                    iconName="copy"
                                    tooltipText="Duplicate"
                                />
                                <TooltipButton
                                    onClick={handleDeleteSelectedObject}
                                    aria-label="Delete Selected Object"
                                    iconName="trash"
                                    tooltipText="Delete"
                                    className="!bg-red-600/80 hover:!bg-red-600"
                                />
                                <div className="border-l border-gray-600 h-6 mx-1"></div>
                            </>
                        )}
                        <TooltipButton
                            onClick={() => setIsPanMode(!isPanMode)}
                            className={isPanMode ? '!bg-indigo-500' : ''}
                            aria-label="Toggle Pan Mode (V)"
                            iconName="hand"
                            tooltipText="Pan (V)"
                        />
                        <TooltipButton
                            onClick={() => setIsShapesPaletteOpen(true)}
                            aria-label="Open Shapes Palette"
                            iconName="shapes"
                            tooltipText="Add Shape"
                        />
                        <TooltipButton
                            onClick={handleAddSubgraph}
                            aria-label="Add Subgraph"
                            iconName="folder"
                            tooltipText="Add Subgraph"
                        />
                    </div>
                </div>
                
                <ShapesPalette 
                    isOpen={isShapesPaletteOpen}
                    onClose={() => setIsShapesPaletteOpen(false)}
                    onAddShape={handleAddShape}
                    theme={theme}
                />

                <MoveToSubgraphModal
                    isOpen={isMoveToSubgraphModalOpen}
                    onClose={() => setIsMoveToSubgraphModalOpen(false)}
                    subgraphs={diagramObjects.subgraphs}
                    onMove={handleMoveToSubgraph}
                />
                
                <style>{`
                    .selected-object {
                        outline: 3px solid #6366F1; /* Indigo-500 */
                        outline-offset: 4px;
                        border-radius: 4px;
                        transition: outline 0.1s ease-in-out;
                    }
                    .linking-target {
                        outline: 3px solid #F59E0B; /* Amber-500 */
                        outline-offset: 4px;
                        border-radius: 4px;
                        transition: outline 0.1s ease-in-out;
                    }
                    .visual-canvas svg {
                        max-width: none;
                        max-height: none;
                        height: auto;
                        overflow: visible;
                    }
                    .visual-canvas .subgraph, .visual-canvas .cluster, .visual-canvas .node, .edge, .actor, .participant, .class, path[id^="L_"], g.edgePath, g.edgeLabel {
                        cursor: pointer;
                    }
                    .visual-canvas .subgraph, .visual-canvas .cluster, .visual-canvas .node {
                        cursor: grab;
                    }
                `}</style>
                <div 
                    ref={svgContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onWheel={handleWheel}
                    className="w-full h-full p-4 visual-canvas flex-grow relative grid place-items-center overflow-hidden"
                    style={{ cursor: isPanMode ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                >
                    <div
                        style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                        }}
                    >
                        {error && (
                            <div className="text-red-400 bg-red-900/50 rounded-md font-mono text-sm max-w-lg relative z-0 text-center">
                                {error}
                            </div>
                        )}
                        {!error && svgContent && (
                            <div className="relative z-0" dangerouslySetInnerHTML={{ __html: svgContent }} />
                        )}
                        {!error && !svgContent && (
                            <div className="text-center text-gray-500 relative z-0">
                                <Icon name="visual" className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <p>Diagram preview will appear here.</p>
                                <p className="text-sm">Start by writing or loading a diagram in the Editor.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg">
                        <Button onClick={zoomIn} className="!p-2" title="Zoom In"><Icon name="zoom-in" className="w-4 h-4" /></Button>
                        <Button onClick={zoomOut} className="!p-2" title="Zoom Out"><Icon name="zoom-out" className="w-4 h-4" /></Button>
                        <Button onClick={resetTransform} className="!p-2" title="Reset View"><Icon name="refresh-cw" className="w-4 h-4" /></Button>
                    </div>

                    {linkingState.startNodeId && linkingState.startPoint && linkingState.endPoint && (
                        <svg overflow="visible" className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                            <line
                                x1={linkingState.startPoint.x}
                                y1={linkingState.startPoint.y}
                                x2={linkingState.endPoint.x}
                                y2={linkingState.endPoint.y}
                                stroke="rgb(129 140 248)"
                                strokeWidth="3"
                                strokeDasharray="8 4"
                                strokeLinecap="round"
                            />
                            <circle cx={linkingState.endPoint.x} cy={linkingState.endPoint.y} r="5" fill="rgb(129 140 248)" />
                        </svg>
                    )}
                </div>
            </main>
            
            <div
                onMouseDown={handleMouseDownOnDivider}
                className="h-full w-2 flex-shrink-0 cursor-col-resize bg-gray-700 hover:bg-indigo-500 transition-colors"
            />
             
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
                            <FormattingPanel
                                selectedObject={selectedObject}
                                linkIndex={linkIndexForFormatting}
                                onClose={() => setSelectedObject(null)}
                                code={code}
                                onCodeChange={onCodeChange}
                                theme={theme}
                                subgraphs={diagramObjects.subgraphs}
                                onOpenMoveToSubgraphModal={() => setIsMoveToSubgraphModalOpen(true)}
                                isInSubgraph={nodeContext.isInSubgraph}
                                onRemoveFromSubgraph={handleRemoveFromSubgraph}
                                onDeleteObject={handleDeleteSelectedObject}
                                onUpdateLink={handleUpdateLink}
                                onSwapLinkDirection={handleSwapLinkDirection}
                            />
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
};
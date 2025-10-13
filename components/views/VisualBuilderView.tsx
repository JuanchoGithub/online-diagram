import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ThemeName } from '../../types';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { ShapesPalette } from '../ShapesPalette';
import type { Shape } from '../shapesData';

interface VisualBuilderViewProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    theme: ThemeName;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface DiagramObject {
    id: string;
    label: string;
}

interface ParsedDiagramObjects {
    nodes: DiagramObject[];
    edges: DiagramObject[];
    subgraphs: DiagramObject[];
    others: DiagramObject[];
}

const formatNodeId = (id: string): string => {
    const parts = id.split('-');
    // Handles cases like 'flowchart-A-1', returning 'A'
    // Also handles 'flowchart-my-node-1' returning 'my-node'
    if (parts.length >= 3 && !isNaN(parseInt(parts[parts.length - 1], 10))) {
        return parts.slice(1, parts.length - 1).join('-');
    }
    return id; // Fallback for other ID formats
};

const formatEdgeId = (id: string): string => {
    const parts = id.split('_');
    if (parts[0] === 'L' && parts.length >= 3) {
        const source = parts[1];
        const targetParts = parts.slice(2);
        
        // Check if the last part is a numeric index and remove it if there's more than one part
        if (targetParts.length > 0 && /^\d+$/.test(targetParts[targetParts.length - 1])) {
            // This handles cases like L_A_B_0 -> A -> B
            // It will only pop if there is something before the number, to not break L_A_0
            if (targetParts.length > 1) {
                targetParts.pop();
            }
        }

        const target = targetParts.join('_');
        return `${source} -> ${target}`;
    }
    return id;
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

    // First pass: build the node label map for resolving link names
    svgContainer.querySelectorAll('g.node').forEach(el => {
        const element = el as HTMLElement;
        const id = element.id;
        if (!id) return;
        const coreId = formatNodeId(id);
        const label = getGenericLabel(element, coreId);
        if (label !== coreId) { // Only map "real" labels
            nodeLabelMap.set(coreId, label);
        }
    });

    // Second pass: categorize all elements and build final lists
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
                edges.push({ id, label: displayLabel });
            } else {
                 edges.push({ id, label: formatEdgeId(id) });
            }
            categorized = true;
        }
        
        if (!categorized) {
            others.push({ id, label: getGenericLabel(element, id) });
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
    onSelect: (id: string) => void;
    showId?: boolean;
    idFormatter?: (id: string) => string;
    defaultOpen?: boolean;
}> = ({ title, objects, icon, selectedId, onSelect, showId = false, idFormatter = (id) => id, defaultOpen = true }) => {
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
                                    onClick={() => onSelect(obj.id)}
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

export const VisualBuilderView: React.FC<VisualBuilderViewProps> = ({ code, onCodeChange, theme, showToast }) => {
    const [svgContent, setSvgContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [diagramObjects, setDiagramObjects] = useState<ParsedDiagramObjects>({ nodes: [], edges: [], subgraphs: [], others: [] });
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isShapesPaletteOpen, setIsShapesPaletteOpen] = useState(false);
    const [linkingTargetId, setLinkingTargetId] = useState<string | null>(null);
    const [linkingState, setLinkingState] = useState<{
        startNodeId: string | null;
        startPoint: { x: number; y: number } | null;
        endPoint: { x: number; y: number } | null;
    }>({ startNodeId: null, startPoint: null, endPoint: null });
    const [sidebarSize, setSidebarSize] = useState(25); // In percentage
    const [isDragging, setIsDragging] = useState(false);

    const nodeCounterRef = useRef(1);
    const dragStartPointRef = useRef<{ x: number; y: number; target: HTMLElement | null } | null>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mermaidId = 'visual-builder-preview';

    const handleMouseDownOnDivider = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const newSidebarWidth = containerRect.right - e.clientX;
                const newSize = (newSidebarWidth / containerRect.width) * 100;
                setSidebarSize(Math.max(15, Math.min(50, newSize))); // Constrain sidebar size
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
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
    }, [isDragging]);

    useEffect(() => {
        const renderMermaid = async () => {
            if (!code.trim()) {
                setSvgContent('');
                setError(null);
                setDiagramObjects({ nodes: [], edges: [], subgraphs: [], others: [] });
                return;
            }
            try {
                setSelectedId(null);
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
            // Use a small timeout to ensure the DOM has been updated by dangerouslySetInnerHTML
            const timer = setTimeout(() => {
                if (svgContainerRef.current) {
                    const objects = parseSvgForObjects(svgContainerRef.current);
                    setDiagramObjects(objects);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [svgContent]);

    useEffect(() => {
        if (!svgContainerRef.current) return;
        
        const previouslySelected = svgContainerRef.current.querySelector('.selected-object');
        if (previouslySelected) previouslySelected.classList.remove('selected-object');
        
        if (selectedId) {
            const elementToSelect = svgContainerRef.current.querySelector(`#${CSS.escape(selectedId)}`);
            if (elementToSelect) elementToSelect.classList.add('selected-object');

            // Also select edge labels if the edge is selected
            if (selectedId.startsWith('L_')) {
                 const labelId = `edgeLabel_${selectedId}`;
                 const labelElement = svgContainerRef.current.querySelector(`#${CSS.escape(labelId)}`);
                 if (labelElement) labelElement.classList.add('selected-object');
            }
        }
    }, [selectedId, svgContent]);

    useEffect(() => {
        if (!svgContainerRef.current) return;

        // Clear previous target highlight
        const previousTarget = svgContainerRef.current.querySelector('.linking-target');
        if (previousTarget) {
            previousTarget.classList.remove('linking-target');
        }

        // Set new target highlight
        if (linkingTargetId) {
            const newTarget = svgContainerRef.current.querySelector(`#${CSS.escape(linkingTargetId)}`);
            if (newTarget) {
                newTarget.classList.add('linking-target');
            }
        }
    }, [linkingTargetId, svgContent]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
        if (!dragStartPointRef.current) return;

        const dragDistance = Math.sqrt(
            Math.pow(e.clientX - dragStartPointRef.current.x, 2) +
            Math.pow(e.clientY - dragStartPointRef.current.y, 2)
        );

        if (dragDistance > 5 && linkingState.startNodeId) {
            // This was a drag operation for linking
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
            // This was a click operation for selection
            const target = dragStartPointRef.current.target;
            if (target) {
                const edgePath = target.closest('path[id^="L_"]');
                if (edgePath && edgePath.id) {
                    setSelectedId(edgePath.id);
                } else {
                    const parentGroup = target.closest('g.subgraph, g.cluster, g.node, g.edge, g.actor, g.participant, g.class');
                    if (parentGroup && parentGroup.id) {
                        setSelectedId(parentGroup.id);
                    } else {
                        setSelectedId(null);
                    }
                }
            }
        }

        dragStartPointRef.current = null;
        setLinkingState({ startNodeId: null, startPoint: null, endPoint: null });
        setLinkingTargetId(null);
    };
    
    const handleAddShape = (shape: Shape) => {
        const newNodeId = `node${nodeCounterRef.current}`;
        nodeCounterRef.current++;

        let newNodeCode = '';
        const nodeLabel = `"${shape.name}"`;

        if (shape.type === 'classic') {
            newNodeCode = `${newNodeId}${shape.syntax.replace('Text', nodeLabel)}`;
        } else {
            newNodeCode = `${newNodeId}@{ shape: ${shape.syntax}, label: ${nodeLabel} }`;
        }

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
    
    return (
        <div ref={containerRef} className="flex h-[calc(100vh-6.5rem)]">
            <main 
                className="bg-gray-800 rounded-lg shadow-lg flex flex-col relative overflow-hidden"
                style={{ width: `calc(100% - ${sidebarSize}% - 8px)` }}
            >
                 <div className="flex-shrink-0 bg-gray-700 p-2 px-4 flex justify-between items-center rounded-t-lg">
                    <h3 className="text-sm font-semibold text-gray-300">Canvas</h3>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setIsShapesPaletteOpen(true)}>
                            <Icon name="shapes" className="w-4 h-4 mr-1"/> Shapes
                        </Button>
                    </div>
                </div>
                
                <ShapesPalette 
                    isOpen={isShapesPaletteOpen}
                    onClose={() => setIsShapesPaletteOpen(false)}
                    onAddShape={handleAddShape}
                    theme={theme}
                />
                
                <style>{`
                    .selected-object {
                        outline: 3px solid #6366F1; /* Indigo-500 */
                        outline-offset: 4px;
                        border-radius: 4px;
                    }
                    .linking-target {
                        outline: 3px solid #F59E0B; /* Amber-500 */
                        outline-offset: 4px;
                        border-radius: 4px;
                        transition: outline 0.1s ease-in-out;
                    }
                    .selected-object path {
                        stroke: #6366F1 !important;
                        stroke-width: 3px !important;
                    }
                    .visual-canvas svg {
                        max-width: 100%;
                        max-height: 100%;
                        height: auto;
                        overflow: visible;
                    }
                    .visual-canvas .subgraph, .visual-canvas .cluster, .visual-canvas .node, .edge, .actor, .participant, .class, path[id^="L_"] {
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
                    className="w-full h-full p-4 visual-canvas flex-grow relative grid place-items-center overflow-hidden"
                >
                    {error && (
                        <div className="text-red-400 bg-red-900/50 rounded-md font-mono text-sm max-w-lg relative z-0 text-center">
                            {error}
                        </div>
                    )}
                    {!error && svgContent && (
                        <div className="max-w-full max-h-full relative z-0" dangerouslySetInnerHTML={{ __html: svgContent }} />
                    )}
                    {!error && !svgContent && (
                        <div className="text-center text-gray-500 relative z-0">
                            <Icon name="visual" className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p>Diagram preview will appear here.</p>
                            <p className="text-sm">Start by writing or loading a diagram in the Editor.</p>
                        </div>
                    )}

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
                className="bg-gray-800 rounded-lg p-4 overflow-y-auto"
                style={{ width: `${sidebarSize}%` }}
            >
                <h3 className="text-base font-semibold text-white mb-4">Diagram Objects</h3>
                <CollapsibleObjectList title="Subgraphs" objects={diagramObjects.subgraphs} icon="folder" selectedId={selectedId} onSelect={setSelectedId} showId={true} />
                <CollapsibleObjectList title="Nodes" objects={diagramObjects.nodes} icon="square" selectedId={selectedId} onSelect={setSelectedId} showId={true} idFormatter={formatNodeId} />
                <CollapsibleObjectList title="Links" objects={diagramObjects.edges} icon="link" selectedId={selectedId} onSelect={setSelectedId} showId={true} idFormatter={formatEdgeId} />
                <CollapsibleObjectList title="Others" objects={diagramObjects.others} icon="git-commit" selectedId={selectedId} onSelect={setSelectedId} defaultOpen={false} />
            </aside>
        </div>
    );
};

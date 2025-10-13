import React, { useState, useEffect, useRef } from 'react';
import type { ThemeName } from '../../types';
import { Icon } from '../Icon';

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
        const textEl = element.querySelector('.label text, .label div, :scope > text, :scope > div');
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
}> = ({ title, objects, icon, selectedId, onSelect, showId = false, idFormatter = (id) => id }) => {
    const [isOpen, setIsOpen] = useState(true);

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
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const mermaidId = 'visual-builder-preview';

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

    const handleSvgClick = (e: React.MouseEvent) => {
        let target = e.target as HTMLElement;
        if (target.id && target.id.startsWith('L_')) {
            setSelectedId(target.id);
            return;
        }
        const parentGroup = target.closest('g.subgraph, g.cluster, g.node, g.edge, g.actor, g.participant, g.class');
        if (parentGroup && parentGroup.id) {
            setSelectedId(parentGroup.id);
        } else {
            setSelectedId(null);
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
            <main className="md:col-span-3 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center relative overflow-hidden">
                <style>{`
                    .selected-object {
                        outline: 3px solid #6366F1; /* Indigo-500 */
                        outline-offset: 4px;
                        border-radius: 4px;
                    }
                    .selected-object path {
                        stroke: #6366F1 !important;
                        stroke-width: 3px !important;
                    }
                    .visual-canvas svg {
                        max-width: 100%;
                        max-height: 100%;
                        height: auto;
                    }
                    .visual-canvas .subgraph, .visual-canvas .cluster, .visual-canvas .node, .edge, .actor, .participant, .class, path[id^="L_"] {
                        cursor: pointer;
                    }
                `}</style>
                <div 
                    ref={svgContainerRef}
                    onClick={handleSvgClick}
                    className="w-full h-full p-4 flex items-center justify-center visual-canvas"
                >
                    {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md font-mono text-sm max-w-lg">{error}</div>}
                    {!error && svgContent && <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />}
                    {!error && !svgContent && (
                        <div className="text-center text-gray-500">
                            <Icon name="visual" className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p>Diagram preview will appear here.</p>
                            <p className="text-sm">Start by writing or loading a diagram in the Editor.</p>
                        </div>
                    )}
                </div>
            </main>
             <aside className="md:col-span-1 bg-gray-800 rounded-lg p-4 overflow-y-auto">
                <h3 className="text-base font-semibold text-white mb-4">Diagram Objects</h3>
                <CollapsibleObjectList title="Subgraphs" objects={diagramObjects.subgraphs} icon="folder" selectedId={selectedId} onSelect={setSelectedId} />
                <CollapsibleObjectList title="Nodes" objects={diagramObjects.nodes} icon="square" selectedId={selectedId} onSelect={setSelectedId} showId={true} idFormatter={formatNodeId} />
                <CollapsibleObjectList title="Links" objects={diagramObjects.edges} icon="link" selectedId={selectedId} onSelect={setSelectedId} showId={true} idFormatter={formatEdgeId} />
                <CollapsibleObjectList title="Others" objects={diagramObjects.others} icon="git-commit" selectedId={selectedId} onSelect={setSelectedId} />
            </aside>
        </div>
    );
};
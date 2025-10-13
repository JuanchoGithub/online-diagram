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

const parseSvgForObjects = (svgContainer: HTMLDivElement | null): ParsedDiagramObjects => {
    if (!svgContainer) return { nodes: [], edges: [], subgraphs: [], others: [] };

    const nodes: DiagramObject[] = [];
    const edges: DiagramObject[] = [];
    const subgraphs: DiagramObject[] = [];
    const others: DiagramObject[] = [];
    const processedIds = new Set<string>();

    const getGenericLabel = (element: Element, defaultId: string): string => {
        // Find label text, preferring specific label containers but falling back to any text
        const textEl = element.querySelector('.label text, .label div, :scope > text, :scope > div');
        return textEl?.textContent?.trim() || defaultId;
    };

    // Iterate over all elements with an ID
    svgContainer.querySelectorAll('[id]').forEach(el => {
        const element = el as HTMLElement;
        const id = element.id;
        if (!id || processedIds.has(id)) return;

        let categorized = false;

        // Only categorize certain types for groups
        if (element.tagName.toLowerCase() === 'g') {
            // The order of these checks is important to prevent mis-categorization.
            if (element.matches('.subgraph, .cluster')) {
                subgraphs.push({ id, label: getGenericLabel(element, id) });
                categorized = true;
            } else if (element.classList.contains('edgePath')) {
                const labelId = `${id}-label`;
                const labelGroup = svgContainer.querySelector(`g[id="${CSS.escape(labelId)}"]`);
                const labelText = labelGroup?.textContent?.trim();
                const label = labelText || id; // Default to the link ID if no text label exists
                edges.push({ id, label });
                categorized = true;
            } else if (element.matches('.node')) {
                nodes.push({ id, label: getGenericLabel(element, id) });
                categorized = true;
            } else if (element.matches('.actor, .participant, .class')) {
                others.push({ id, label: getGenericLabel(element, id) });
                categorized = true;
            }
        }

        // Fallback for edges based on ID pattern
        if (!categorized && id.startsWith('L-')) {
            const labelId = `${id}-label`;
            const labelGroup = svgContainer.querySelector(`g[id="${CSS.escape(labelId)}"]`);
            const labelText = labelGroup?.textContent?.trim();
            const label = labelText || id;
            edges.push({ id, label });
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
}> = ({ title, objects, icon, selectedId, onSelect }) => {
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
                                    <span className="truncate">{obj.label}</span>
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
        previouslySelected?.classList.remove('selected-object');
        
        if (selectedId) {
            const elementToSelect = svgContainerRef.current.querySelector(`#${CSS.escape(selectedId)}`);
            elementToSelect?.classList.add('selected-object');

            // Also select edge labels if the edge is selected
            if (selectedId.startsWith('L-')) {
                 const labelId = `${selectedId}-label`;
                 const labelElement = svgContainerRef.current.querySelector(`g[id="${CSS.escape(labelId)}"]`);
                 labelElement?.classList.add('selected-object');
            }
        }
    }, [selectedId, svgContent]);

    const handleSvgClick = (e: React.MouseEvent) => {
        let target = e.target as HTMLElement;
        const parentGroup = target.closest('g.subgraph, g.cluster, g.node, g.edge, g.actor, g.participant, g.class, g[id^="L-"]');

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
                    .visual-canvas svg {
                        max-width: 100%;
                        max-height: 100%;
                        height: auto;
                    }
                    .visual-canvas .subgraph, .visual-canvas .cluster, .visual-canvas .node, .edge, .actor, .participant, .class, g[id^="L-"] {
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
                <CollapsibleObjectList title="Nodes" objects={diagramObjects.nodes} icon="square" selectedId={selectedId} onSelect={setSelectedId} />
                <CollapsibleObjectList title="Links" objects={diagramObjects.edges} icon="link" selectedId={selectedId} onSelect={setSelectedId} />
                <CollapsibleObjectList title="Others" objects={diagramObjects.others} icon="git-commit" selectedId={selectedId} onSelect={setSelectedId} />
            </aside>
        </div>
    );
};

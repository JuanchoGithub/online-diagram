import type { DiagramObject, ParsedDiagramObjects } from '../../../types';

export const formatNodeId = (id: string): string => {
    const parts = id.split('-');
    if (parts.length >= 3 && !isNaN(parseInt(parts[parts.length - 1], 10))) {
        return parts.slice(1, parts.length - 1).join('-');
    }
    return id;
};

export const parseSvgForObjects = (svgContainer: HTMLDivElement | null): ParsedDiagramObjects => {
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

export const findLinkIndex = (code: string, selectedEdgeId: string): number => {
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

export const findNodeContext = (code: string, nodeId: string): { isInSubgraph: boolean } => {
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

export const findNodeSyntaxInCode = (lines: string[], nodeId: string): string | null => {
    const fullDefRegex = new RegExp(
        `\\b${nodeId}` +
        `(` +
            `\\[[^\\]]*?\\]|` +
            `\\(\\([^\\]]*?\\)\\)|` +
            `\\(\\[[^\\]]*?\\]\\)|` +
            `\\[\\[[^\\]]*?\\]\\]|` +
            `\\[\\([^\\]]*?\\)\\]|` +
            `\\{\\{[^\\]]*?\\}\\}|` +
            `\\{[^\\]]*?\\}|` +
            `\\([^\\]]*?\\)|` +
            `>[^\\]]*?\\]|` +
            `\\[/[^\\]]*?\\\\]|` +
            `\\[\\\\[^\\]]*?/]|` +
            `\\[/[^\\]]*?/]|` +
            `\\[\\\\[^\\]]*?\\\\]|` +
            `@\\{[^\\}]*?\\}` +
        `)`
    );

    for (const line of lines) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(fullDefRegex);
        
        if (match && (trimmedLine.startsWith(match[0]) || trimmedLine.includes(`--> ${match[0]}`))) {
            return match[0];
        }
    }

    const idOnlyRegex = new RegExp(`^\\s*${nodeId}\\s*(;.*|-->|---|$)`);
    for (const line of lines) {
        if (idOnlyRegex.test(line.trim())) {
            return nodeId;
        }
    }

    return null;
};

export const reconstructDefinition = (nodeId: string, definitionFromCode: string, trustedLabel: string): string => {
    if (trustedLabel === nodeId) {
        return definitionFromCode;
    }

    const quotedLabel = `"${trustedLabel}"`;

    if (nodeId === definitionFromCode) {
        return `${nodeId}[${quotedLabel}]`;
    }
    
    if (definitionFromCode.startsWith('@{')) {
        return `${nodeId}${definitionFromCode}`;
    }

    const openSyntaxMatch = definitionFromCode.match(/^[(\[{>\/\\]+/);
    const closeSyntaxMatch = definitionFromCode.match(/[)\]}\/\\]+$/);

    if (openSyntaxMatch && closeSyntaxMatch) {
        return `${nodeId}${openSyntaxMatch[0]}${quotedLabel}${closeSyntaxMatch[0]}`;
    }

    return definitionFromCode;
};

export const parseLinkLineForSourceTarget = (line: string): { source: string; target: string } | null => {
    const linkRegex = /^\s*([\w\d.-]+)\s*.*?(-->|---|--\.|==>|<-->|--o|o--o|--x|x--x)/;
    const lineMatch = linkRegex.exec(line);

    if (lineMatch) {
        const source = lineMatch[1];
        const arrow = lineMatch[2];
        const afterArrow = line.substring(line.indexOf(arrow) + arrow.length);
        
        const targetMatch = afterArrow.match(/^\s*"?([\w\d.-]+)"?/);

        if (targetMatch) {
            const target = targetMatch[1];
            return { source, target };
        }
    }
    return null;
};

export const getInternalNodeIds = (subgraphCodeLines: string[]): Set<string> => {
    const nodeIds = new Set<string>();
    const nodeDefRegex = /^\s*([\w\d.-]+)/;

    subgraphCodeLines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || /^(subgraph|end|direction|classDef|class|style|linkStyle|%%)/.test(trimmed)) {
            return;
        }

        const linkParts = parseLinkLineForSourceTarget(trimmed);
        if (linkParts) {
            nodeIds.add(linkParts.source);
            nodeIds.add(linkParts.target);
        } else {
            const nodeMatch = trimmed.match(nodeDefRegex);
            if (nodeMatch && nodeMatch[1]) {
                nodeIds.add(nodeMatch[1]);
            }
        }
    });

    return nodeIds;
};

export const buildNodeToSubgraphMap = (code: string): Map<string, string> => {
    const lines = code.split('\n');
    const nodeMap = new Map<string, string>();
    const currentSubgraphStack: string[] = [];
    const nodeDefRegex = /^\s*([\w\d.-]+)/;
    const subgraphDefRegex = /subgraph\s+(?:\w+\s*\[\s*"([^"]+)"\s*\]|"([^"]+)"|(\w+))/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('subgraph ')) {
            const match = trimmed.match(subgraphDefRegex);
            const subgraphLabel = match ? (match[1] || match[2] || match[3]) : `subgraph_${currentSubgraphStack.length}`;
            currentSubgraphStack.push(subgraphLabel);
        } else if (trimmed === 'end') {
            currentSubgraphStack.pop();
        } else if (!/^(direction|classDef|class|style|linkStyle|%%)/.test(trimmed)) {
            const currentSubgraph = currentSubgraphStack.length > 0 ? currentSubgraphStack[currentSubgraphStack.length - 1] : null;
            if (currentSubgraph) {
                 const linkParts = parseLinkLineForSourceTarget(trimmed);
                 if (linkParts) {
                     if (!nodeMap.has(linkParts.source)) nodeMap.set(linkParts.source, currentSubgraph);
                     if (!nodeMap.has(linkParts.target)) nodeMap.set(linkParts.target, currentSubgraph);
                 } else {
                     const nodeMatch = trimmed.match(nodeDefRegex);
                     if (nodeMatch && nodeMatch[1]) {
                        if (!nodeMap.has(nodeMatch[1])) nodeMap.set(nodeMatch[1], currentSubgraph);
                     }
                 }
            }
        }
    }
    return nodeMap;
};

export const getAllLinks = (code: string): { source: string, target: string, line: string, lineIndex: number }[] => {
    const allLinks: { source: string, target: string, line: string, lineIndex: number }[] = [];
    const lines = code.split('\n');
    
    const linkRegex = /^\s*([\w\d.-]+)\s*.*?(-->|---|--\.|==>|<-->|--o|o--o|--x|x--x)/;

    for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        const lineMatch = linkRegex.exec(trimmedLine);

        if (lineMatch) {
            const source = lineMatch[1];
            const arrow = lineMatch[2];
            const afterArrow = trimmedLine.substring(trimmedLine.indexOf(arrow) + arrow.length);
            
            const targetMatch = afterArrow.match(/^\s*"?([\w\d.-]+)"?/);

            if (targetMatch) {
                const target = targetMatch[1];
                allLinks.push({ source, target, line: trimmedLine, lineIndex: i });
            }
        }
    }
    return allLinks;
};

export const parseNodeStyle = (code: string, nodeId: string): Record<string, string> => {
    const styleRegex = new RegExp(`^\\s*style\\s+${nodeId}\\s+([\\s\\S]*?)$`, 'm');
    const match = code.match(styleRegex);
    if (!match || !match[1]) return {};
    
    const styles: Record<string, string> = {};
    match[1].split(',').forEach(part => {
        const [key, value] = part.split(':');
        if (key && value) {
            styles[key.trim()] = value.trim();
        }
    });
    return styles;
};

export const parseLinkStyle = (code: string, linkIndex: number): Record<string, string> => {
    if (linkIndex < 0) return {};
    const styleRegex = new RegExp(`^\\s*linkStyle\\s+${linkIndex}\\s+([\\s\\S]*?)$`, 'm');
    const match = code.match(styleRegex);
    if (!match || !match[1]) return {};
    
    const styles: Record<string, string> = {};
    match[1].split(',').forEach(part => {
        const [key, value] = part.split(':');
        if (key && value) {
            styles[key.trim()] = value.trim();
        }
    });
    return styles;
};

export const parseNodeDefinition = (code: string, nodeId: string): { label: string; fullLine: string; type: 'classic' | 'advanced' | 'id-only' } | null => {
    const nodeRegex = new RegExp(`^(\\s*)${nodeId}(.*)$`, 'm');
    const match = code.match(nodeRegex);
    if (!match) return null;

    const fullLine = match[0];
    const definition = match[2].trim();
    
    const advancedLabelRegex = /@\{[\s\S]*?label:\s*[`"](.*?)[`"][\s\S]*?\}/;
    const advancedMatch = definition.match(advancedLabelRegex);
    if(advancedMatch && advancedMatch[1] !== undefined){
        return { label: advancedMatch[1], fullLine, type: 'advanced' };
    }
    
    const classicLabelRegex = /(\[|\(|\{)(?:[`"]?)([\s\S]*?)(?:[`"]?)(\]|\)|\})/;
    const labelMatch = definition.match(classicLabelRegex);
    if (labelMatch && labelMatch[2] !== undefined) {
        const simpleMatch = definition.match(/(\[|\(|\{)(?:[`"]?)([\s\S]*?)(?:[`"]?)(\]|\)|\})/);
        if (simpleMatch && simpleMatch[2] !== undefined) {
            return { label: simpleMatch[2], fullLine, type: 'classic' };
        }
    }

    return { label: definition ? definition : nodeId, fullLine, type: 'id-only' };
};

export const parseImageNode = (label: string): { isImage: true; src: string; width?: string; height?: string; title?: string } | { isImage: false } => {
    const imgTagMatch = label.match(/<img\s+(.*?)\/?>\s*(.*)/s);
    if (!imgTagMatch) {
        return { isImage: false };
    }

    const attrsString = imgTagMatch[1];
    const title = imgTagMatch[2].trim();

    const getAttr = (attrName: string) => {
        const regex = new RegExp(`${attrName}=['"](.*?)['"]`);
        const match = attrsString.match(regex);
        return match ? match[1] : undefined;
    };

    const src = getAttr('src');
    if (!src) return { isImage: false };

    return {
        isImage: true,
        src,
        width: getAttr('width'),
        height: getAttr('height'),
        title,
    };
};

const LINK_TYPES = [
    { label: 'Arrow', value: '-->' },
    { label: 'Line', value: '---' },
    { label: 'Dotted', value: '-.->' },
    { label: 'Thick', value: '==>' },
    { label: 'Bi-directional', value: '<-->' },
    { label: 'Circle End', value: '--o' },
    { label: 'Circle Both', value: 'o--o' },
    { label: 'Cross End', value: '--x' },
    { label: 'Cross Both', value: 'x--x' },
];

export const parseLinkLine = (line: string): { arrow: string; text: string } => {
    const textMatch = line.match(/--\s*"(.*?)"\s*--/) || line.match(/\|(.*?)\|/);
    if (textMatch && textMatch[1] !== undefined) {
        return { arrow: '-->', text: textMatch[1] };
    }

    for (const link of LINK_TYPES.sort((a,b) => b.value.length - a.value.length)) {
        if (line.includes(link.value)) {
            return { arrow: link.value, text: '' };
        }
    }
    return { arrow: '---', text: '' };
};

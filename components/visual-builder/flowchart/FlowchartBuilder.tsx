import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ThemeName, DiagramObject, ParsedDiagramObjects } from '../../../types';
import { Icon } from '../../Icon';
import { Button } from '../../Button';
import { ShapesPalette } from '../../ShapesPalette';
import type { Shape } from '../../shapesData';
import { MoveToSubgraphModal } from '../../MoveToSubgraphModal';
import { ConfirmationModal } from '../../ConfirmationModal';
import { IconPickerModal } from '../../IconPickerModal';
// Fix: Import `SelectedObject` type from `./helpers` instead of from `FlowchartSidebar` which doesn't export it.
import { FlowchartSidebar } from './FlowchartSidebar';
import { TooltipButton } from '../shared/TooltipButton';
import { 
    formatNodeId, 
    buildNodeToSubgraphMap,
    getAllLinks,
    findLinkIndex,
    parseLinkLineForSourceTarget,
    getInternalNodeIds,
    findNodeSyntaxInCode,
    reconstructDefinition,
    parseSvgForObjects,
    type SelectedObject
} from './helpers';

interface VisualBuilderViewProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    theme: ThemeName;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const FlowchartBuilder: React.FC<VisualBuilderViewProps> = ({ code, onCodeChange, theme, showToast }) => {
    const [svgContent, setSvgContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [diagramObjects, setDiagramObjects] = useState<ParsedDiagramObjects>({ nodes: [], edges: [], subgraphs: [], others: [] });
    const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
    const [isShapesPaletteOpen, setIsShapesPaletteOpen] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [isMoveToSubgraphModalOpen, setIsMoveToSubgraphModalOpen] = useState(false);
    const [linkingTargetId, setLinkingTargetId] = useState<string | null>(null);
    const [linkingState, setLinkingState] = useState<{
        startNodeId: string | null;
        startPoint: { x: number; y: number } | null;
        endPoint: { x: number; y: number } | null;
    }>({ startNodeId: null, startPoint: null, endPoint: null });
    const [sidebarSize, setSidebarSize] = useState(25); 
    const [isResizing, setIsResizing] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<{ sourceId: string; targetId: string } | null>(null);
    
    const [isPanMode, setIsPanMode] = useState(false);
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: React.ReactNode;
        onConfirm: () => void;
        onClose: () => void;
        confirmText?: string;
        cancelText?: string;
        confirmButtonClass?: string;
        onSecondaryAction?: () => void;
        secondaryActionText?: string;
        secondaryActionButtonClass?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        onClose: () => {},
    });

    const nodeCounterRef = useRef(1);
    const subgraphCounterRef = useRef(1);
    const dragStartPointRef = useRef<{ x: number; y: number; target: HTMLElement | null } | null>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mermaidId = 'visual-builder-preview';

    const handleMouseDownOnDivider = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleDeleteSelectedObject = useCallback(() => {
        if (!selectedObject) return;

        const { id, type } = selectedObject;
        const closeConfirmation = () => setConfirmationState(s => ({ ...s, isOpen: false }));

        if (type === 'node') {
            const nodeId = formatNodeId(id);
            const nodeObject = diagramObjects.nodes.find(n => n.id === id);
            const nodeLabel = nodeObject?.label || nodeId;

            const nodeToSubgraphMap = buildNodeToSubgraphMap(code);
            let lines = code.split('\n');
            const linesToDelete = new Set<number>();
            const neighborNodes = new Set<string>();
            let deletedLinks = 0;

            const preDeleteBestDefs = new Map<string, string>();
            const allObjects = [...diagramObjects.nodes, ...diagramObjects.subgraphs];
            for (const obj of allObjects) {
                const currentId = formatNodeId(obj.id);
                const trustedLabel = obj.label;
                const defFromCode = findNodeSyntaxInCode(lines, currentId);
                
                if (defFromCode) {
                    const bestDef = reconstructDefinition(currentId, defFromCode, trustedLabel);
                    preDeleteBestDefs.set(currentId, bestDef);
                } else {
                    preDeleteBestDefs.set(currentId, currentId);
                }
            }

            lines.forEach((line, index) => {
                const trimmed = line.trim();
                const wordBoundaryNodeRegex = new RegExp(`\\b${nodeId}\\b`);
                if (!wordBoundaryNodeRegex.test(trimmed)) return;

                let shouldDelete = false;
                const linkArrowRegex = /(?:--.*?-->|-->|---|~~~|==>|<-->|--o|o--o|--x|x--x|-\.->)/;
                if (linkArrowRegex.test(trimmed)) {
                    const linkParts = parseLinkLineForSourceTarget(trimmed);
                    if (linkParts) {
                        const { source, target } = linkParts;
                        if (source === nodeId || target === nodeId) {
                            shouldDelete = true;
                            deletedLinks++;
                            if (source && source !== nodeId) neighborNodes.add(source);
                            if (target && target !== nodeId) neighborNodes.add(target);
                        }
                    }
                } else if (new RegExp(`^\\s*${nodeId}\\b`).test(trimmed)) {
                    shouldDelete = true;
                } else if (new RegExp(`^\\s*style\\s+${nodeId}\\b`).test(trimmed)) {
                    shouldDelete = true;
                } else if (trimmed.startsWith('class ')) {
                    const classApplyRegex = /^\s*class\s+([\w\d\s,.-]+?)\s+([\w\d.-]+)\s*;?\s*$/;
                    const match = trimmed.match(classApplyRegex);
                    if (match) {
                        const nodePart = match[1];
                        const nodes = nodePart.split(',').map(n => n.trim());
                        if (nodes.includes(nodeId)) {
                            const remainingNodes = nodes.filter(n => n !== nodeId);
                            if (remainingNodes.length > 0) {
                                lines[index] = line.replace(nodePart, remainingNodes.join(', '));
                            } else {
                                shouldDelete = true;
                            }
                        }
                    }
                }
                if (shouldDelete) linesToDelete.add(index);
            });

            const definitionsToAdd = new Set<string>();
            const intermediateLines = lines.filter((_, i) => !linesToDelete.has(i));
            for (const neighborId of neighborNodes) {
                const bestDefInOriginal = preDeleteBestDefs.get(neighborId) || neighborId;
                const bestDefInIntermediate = findNodeSyntaxInCode(intermediateLines, neighborId);
                if (bestDefInOriginal && (!bestDefInIntermediate || bestDefInIntermediate.length < bestDefInOriginal.length)) {
                    definitionsToAdd.add(bestDefInOriginal);
                }
            }

            let finalLines = intermediateLines;
            if (definitionsToAdd.size > 0) {
                let insertIndex = finalLines.findIndex(line => line.trim().startsWith('graph') || line.trim().startsWith('flowchart'));
                insertIndex = (insertIndex === -1) ? 0 : insertIndex + 1;
                while (insertIndex < finalLines.length && (finalLines[insertIndex].trim() === '' || finalLines[insertIndex].trim().startsWith('direction'))) {
                    insertIndex++;
                }
                const indentation = '    ';
                const definitionsArray = Array.from(definitionsToAdd).map(def => `${indentation}${def}`);
                finalLines.splice(insertIndex, 0, ...definitionsArray);
            }

            // Post-processing to ensure neighbor nodes remain in their subgraphs
            const nodesStillInSubgraphBlocks = new Map<string, Set<string>>();
            const subgraphStack: string[] = [];
            const subgraphDefRegex = /subgraph\s+(?:\w+\s*\[\s*"([^"]+)"\s*\]|"([^"]+)"|(\w+))/;
            const nodeMentionRegex = /^\s*([\w\d.-]+)/;
            
            finalLines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('subgraph ')) {
                    const match = trimmed.match(subgraphDefRegex);
                    const currentSubgraphLabel = match ? (match[1] || match[2] || match[3]) : `subgraph_${subgraphStack.length}`;
                    subgraphStack.push(currentSubgraphLabel);
                    if (!nodesStillInSubgraphBlocks.has(currentSubgraphLabel)) {
                        nodesStillInSubgraphBlocks.set(currentSubgraphLabel, new Set<string>());
                    }
                } else if (trimmed === 'end') {
                    subgraphStack.pop();
                } else {
                    const currentSubgraph = subgraphStack.length > 0 ? subgraphStack[subgraphStack.length - 1] : null;
                    if (currentSubgraph && !/^(direction|classDef|class|style|linkStyle|%%)/.test(trimmed)) {
                        const linkParts = parseLinkLineForSourceTarget(trimmed);
                        if (linkParts) {
                            nodesStillInSubgraphBlocks.get(currentSubgraph)?.add(linkParts.source);
                            nodesStillInSubgraphBlocks.get(currentSubgraph)?.add(linkParts.target);
                        } else {
                            const nodeMatch = trimmed.match(nodeMentionRegex);
                            if (nodeMatch && nodeMatch[1]) {
                                nodesStillInSubgraphBlocks.get(currentSubgraph)?.add(nodeMatch[1]);
                            }
                        }
                    }
                }
            });
            
            const nodesToReinsert = new Map<string, string[]>();
            for (const neighborId of neighborNodes) {
                const initialSubgraphLabel = nodeToSubgraphMap.get(neighborId);
                if (initialSubgraphLabel) {
                    const mentionedNodes = nodesStillInSubgraphBlocks.get(initialSubgraphLabel);
                    if (mentionedNodes && !mentionedNodes.has(neighborId)) {
                        if (!nodesToReinsert.has(initialSubgraphLabel)) {
                            nodesToReinsert.set(initialSubgraphLabel, []);
                        }
                        nodesToReinsert.get(initialSubgraphLabel)?.push(neighborId);
                    }
                }
            }

            if (nodesToReinsert.size > 0) {
                const finalLinesWithReinsertion: string[] = [];
                finalLines.forEach(line => {
                    finalLinesWithReinsertion.push(line);
                    const trimmed = line.trim();
                    if (trimmed.startsWith('subgraph ')) {
                        const match = trimmed.match(subgraphDefRegex);
                        const currentSubgraphLabel = match ? (match[1] || match[2] || match[3]) : null;
                        if (currentSubgraphLabel && nodesToReinsert.has(currentSubgraphLabel)) {
                            const indentation = line.match(/^\s*/)?.[0] || '';
                            const orphans = nodesToReinsert.get(currentSubgraphLabel) || [];
                            orphans.forEach(orphanId => {
                                finalLinesWithReinsertion.push(`${indentation}    ${orphanId}`);
                            });
                            nodesToReinsert.delete(currentSubgraphLabel);
                        }
                    }
                });
                finalLines = finalLinesWithReinsertion;
            }

            onCodeChange(finalLines.join('\n').replace(/\n\n+/g, '\n').trim());
            showToast(`Node "${nodeLabel}" and ${deletedLinks} link(s) deleted.`, 'success');
            setSelectedObject(null);

        } else if (type === 'edge') {
            const edgeObject = diagramObjects.edges.find(e => e.id === id);
            if (!edgeObject) return;

            const sourceNode = diagramObjects.nodes.find(n => formatNodeId(n.id) === edgeObject.sourceId);
            const targetNode = diagramObjects.nodes.find(n => formatNodeId(n.id) === edgeObject.targetId);
            const sourceLabel = sourceNode?.label || edgeObject.sourceId;
            const targetLabel = targetNode?.label || edgeObject.targetId;

            setConfirmationState({
                isOpen: true,
                title: 'Confirm Link Deletion',
                message: <p>Are you sure you want to delete the link from <strong>"{sourceLabel}"</strong> to <strong>"{targetLabel}"</strong>?</p>,
                onConfirm: () => {
                    const linkIndex = findLinkIndex(code, id);
                    if (linkIndex !== -1) {
                        const allLinks = getAllLinks(code);
                        if (linkIndex < allLinks.length) {
                            const linkToDel = allLinks[linkIndex];
                            const lines = code.split('\n').filter((_, index) => index !== linkToDel.lineIndex);
                            onCodeChange(lines.join('\n'));
                        }
                    }
                    showToast(`Link from "${sourceLabel}" to "${targetLabel}" deleted.`, 'success');
                    setSelectedObject(null);
                    closeConfirmation();
                },
                onClose: () => {
                    showToast('Link deletion cancelled.', 'info');
                    closeConfirmation();
                }
            });

        } else if (type === 'subgraph') {
            const subgraphObject = diagramObjects.subgraphs.find(s => s.id === id);
            if (!subgraphObject) {
                showToast('Could not find subgraph data.', 'error');
                return;
            }
            const label = subgraphObject.label;
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
            const subgraphRegex = new RegExp(
                `^(\\s*)subgraph\\s+(?:` +
                `\\w+\\s*\\[\\s*"${escapedLabel}"\\s*\\]|` +
                `"${escapedLabel}"|` +
                (label.match(/\s/) ? '(?!)' : `${escapedLabel}\\b`) +
                `)`
            );
            
            let lines = code.split('\n');
            let startIndex = lines.findIndex(line => subgraphRegex.test(line.trim()));
    
            if (startIndex === -1) {
                const subgraphId = formatNodeId(id);
                const fallbackRegex = new RegExp(`^(\\s*)subgraph\\s+(?:${subgraphId}|\"${subgraphId}\"|${subgraphId}\\[.*?\\])\\b`);
                startIndex = lines.findIndex(line => fallbackRegex.test(line.trim()));
    
                if (startIndex === -1) {
                    showToast('Could not find subgraph definition in code.', 'error');
                    return;
                }
            }
        
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
        
            if (endIndex === -1) {
                showToast('Could not find matching "end" for subgraph.', 'error');
                return;
            }
            
            const handleDeleteEverything = () => {
                const currentLines = code.split('\n');
                
                const nodeToSubgraphMap = buildNodeToSubgraphMap(code);

                const preDeleteBestDefs = new Map<string, string>();
                for (const obj of diagramObjects.nodes) {
                    const currentId = formatNodeId(obj.id);
                    const trustedLabel = obj.label;
                    const defFromCode = findNodeSyntaxInCode(currentLines, currentId);
                    if (defFromCode) {
                        const bestDef = reconstructDefinition(currentId, defFromCode, trustedLabel);
                        preDeleteBestDefs.set(currentId, bestDef);
                    } else {
                        preDeleteBestDefs.set(currentId, currentId);
                    }
                }
                
                const subgraphCodeContent = currentLines.slice(startIndex + 1, endIndex);
                const internalNodeIds = getInternalNodeIds(subgraphCodeContent);

                const linesToDelete = new Set<number>();
                const neighborNodes = new Set<string>();

                for (let i = startIndex; i <= endIndex; i++) {
                    linesToDelete.add(i);
                }

                currentLines.forEach((line, index) => {
                    if (linesToDelete.has(index)) return;

                    const trimmed = line.trim();
                    const linkParts = parseLinkLineForSourceTarget(trimmed);
                    
                    if (linkParts) {
                        const { source, target } = linkParts;
                        const isSourceInternal = internalNodeIds.has(source);
                        const isTargetInternal = internalNodeIds.has(target);

                        if ((isSourceInternal && !isTargetInternal) || (!isSourceInternal && isTargetInternal)) {
                            linesToDelete.add(index);
                            if (!isSourceInternal) neighborNodes.add(source);
                            if (!isTargetInternal) neighborNodes.add(target);
                        }
                    }
                });
                
                const intermediateLines = currentLines.filter((_, i) => !linesToDelete.has(i));

                const definitionsToAdd = new Set<string>();
                for (const neighborId of neighborNodes) {
                    if (internalNodeIds.has(neighborId)) continue;

                    const bestDefInOriginal = preDeleteBestDefs.get(neighborId) || neighborId;
                    const bestDefInIntermediate = findNodeSyntaxInCode(intermediateLines, neighborId);
                    
                    if (bestDefInOriginal && (!bestDefInIntermediate || bestDefInIntermediate.length < bestDefInOriginal.length)) {
                        definitionsToAdd.add(bestDefInOriginal);
                    }
                }

                let finalLines = intermediateLines;
                if (definitionsToAdd.size > 0) {
                    let insertIndex = finalLines.findIndex(l => l.trim().startsWith('graph') || l.trim().startsWith('flowchart'));
                    insertIndex = (insertIndex === -1) ? 0 : insertIndex + 1;
                    while (insertIndex < finalLines.length && (finalLines[insertIndex].trim() === '' || finalLines[insertIndex].trim().startsWith('direction'))) {
                        insertIndex++;
                    }
                    const indentation = '    ';
                    const definitionsArray = Array.from(definitionsToAdd).map(def => `${indentation}${def}`);
                    finalLines.splice(insertIndex, 0, ...definitionsArray);
                }
                
                // Post-processing to ensure nodes remain in their subgraphs
                const nodesStillInSubgraphBlocks = new Map<string, Set<string>>();
                const subgraphStack: string[] = [];
                const subgraphDefRegex = /subgraph\s+(?:\w+\s*\[\s*"([^"]+)"\s*\]|"([^"]+)"|(\w+))/;
                const nodeMentionRegex = /^\s*([\w\d.-]+)/;
                
                finalLines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('subgraph ')) {
                        const match = trimmed.match(subgraphDefRegex);
                        const currentSubgraphLabel = match ? (match[1] || match[2] || match[3]) : `subgraph_${subgraphStack.length}`;
                        subgraphStack.push(currentSubgraphLabel);
                        if (!nodesStillInSubgraphBlocks.has(currentSubgraphLabel)) {
                            nodesStillInSubgraphBlocks.set(currentSubgraphLabel, new Set<string>());
                        }
                    } else if (trimmed === 'end') {
                        subgraphStack.pop();
                    } else {
                        const currentSubgraph = subgraphStack.length > 0 ? subgraphStack[subgraphStack.length - 1] : null;
                        if (currentSubgraph && !/^(direction|classDef|class|style|linkStyle|%%)/.test(trimmed)) {
                            const linkParts = parseLinkLineForSourceTarget(trimmed);
                            if (linkParts) {
                                nodesStillInSubgraphBlocks.get(currentSubgraph)?.add(linkParts.source);
                                nodesStillInSubgraphBlocks.get(currentSubgraph)?.add(linkParts.target);
                            } else {
                                const nodeMatch = trimmed.match(nodeMentionRegex);
                                if (nodeMatch && nodeMatch[1]) {
                                    nodesStillInSubgraphBlocks.get(currentSubgraph)?.add(nodeMatch[1]);
                                }
                            }
                        }
                    }
                });
                
                const nodesToReinsert = new Map<string, string[]>();
                for (const [nodeId, initialSubgraphLabel] of nodeToSubgraphMap.entries()) {
                    if (initialSubgraphLabel !== label && !internalNodeIds.has(nodeId)) {
                        const mentionedNodes = nodesStillInSubgraphBlocks.get(initialSubgraphLabel);
                        if (mentionedNodes && !mentionedNodes.has(nodeId)) {
                            if (!nodesToReinsert.has(initialSubgraphLabel)) {
                                nodesToReinsert.set(initialSubgraphLabel, []);
                            }
                            nodesToReinsert.get(initialSubgraphLabel)?.push(nodeId);
                        }
                    }
                }

                if (nodesToReinsert.size > 0) {
                    const finalLinesWithReinsertion: string[] = [];
                    finalLines.forEach(line => {
                        finalLinesWithReinsertion.push(line);
                        const trimmed = line.trim();
                        if (trimmed.startsWith('subgraph ')) {
                            const match = trimmed.match(subgraphDefRegex);
                            const currentSubgraphLabel = match ? (match[1] || match[2] || match[3]) : null;
                            if (currentSubgraphLabel && nodesToReinsert.has(currentSubgraphLabel)) {
                                const indentation = line.match(/^\s*/)?.[0] || '';
                                const orphans = nodesToReinsert.get(currentSubgraphLabel) || [];
                                orphans.forEach(orphanId => {
                                    finalLinesWithReinsertion.push(`${indentation}    ${orphanId}`);
                                });
                                nodesToReinsert.delete(currentSubgraphLabel);
                            }
                        }
                    });
                    finalLines = finalLinesWithReinsertion;
                }
                const objectsInsideCount = internalNodeIds.size;
                onCodeChange(finalLines.join('\n').replace(/\n\n+/g, '\n').trim());
                showToast(`Subgraph "${label}" and its ${objectsInsideCount} child object(s) were deleted.`, 'success');
                setSelectedObject(null);
                closeConfirmation();
            };

            const handleDeleteContainerOnly = () => {
                let currentLines = code.split('\n');
                currentLines.splice(endIndex, 1);
                currentLines.splice(startIndex, 1);
                onCodeChange(currentLines.join('\n').replace(/\n\n+/g, '\n').trim());
                showToast(`Subgraph "${label}" container deleted. Contents have been preserved.`, 'success');
                setSelectedObject(null);
                closeConfirmation();
            };

            const currentLines = code.split('\n');
            const subgraphCodeContent = currentLines.slice(startIndex + 1, endIndex);
            const internalNodeIds = getInternalNodeIds(subgraphCodeContent);
            const objectsInsideCount = internalNodeIds.size;

            setConfirmationState({
                isOpen: true,
                title: `Delete Subgraph "${label}"`,
                message: (
                    <div className="space-y-2">
                        <p>This subgraph contains <strong>{objectsInsideCount} object(s)</strong>.</p>
                        <p>Please choose how you would like to proceed.</p>
                    </div>
                ),
                onConfirm: handleDeleteEverything,
                confirmText: 'Delete Everything',
                confirmButtonClass: '!bg-red-600 hover:!bg-red-700',
                
                onSecondaryAction: handleDeleteContainerOnly,
                secondaryActionText: 'Delete Container Only',
                secondaryActionButtonClass: '!bg-yellow-600 hover:!bg-yellow-700',

                onClose: () => {
                    showToast('Deletion cancelled.', 'info');
                    closeConfirmation();
                },
            });
        }
    
    }, [selectedObject, code, onCodeChange, showToast, diagramObjects]);
    
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
            const subgraphObject = diagramObjects.subgraphs.find(s => s.id === id);
            if (!subgraphObject) {
                showToast('Could not find subgraph data.', 'error');
                return;
            }
            const label = subgraphObject.label;
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
            const subgraphRegex = new RegExp(
                `^(\\s*)subgraph\\s+(?:` +
                `\\w+\\s*\\[\\s*"${escapedLabel}"\\s*\\]|` +
                `"${escapedLabel}"|` +
                (label.match(/\s/) ? '(?!)' : `${escapedLabel}\\b`) +
                `)`
            );
            let startIndex = lines.findIndex(line => subgraphRegex.test(line.trim()));
    
            if (startIndex === -1) {
                const subgraphId = formatNodeId(id);
                const fallbackRegex = new RegExp(`^(\\s*)subgraph\\s+(?:${subgraphId}|\"${subgraphId}\"|${subgraphId}\\[.*?\\])\\b`);
                startIndex = lines.findIndex(line => fallbackRegex.test(line.trim()));
    
                if (startIndex === -1) {
                    showToast('Could not find subgraph definition to duplicate.', 'error');
                    return;
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
                     const subgraphId = formatNodeId(id); // This might be imperfect but used for seeding the map
                     const newSubgraphId = `${subgraphId}${suffix}`;
                     idMap[subgraphId] = newSubgraphId;
                     
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
    }, [selectedObject, code, onCodeChange, showToast, diagramObjects]);
    
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
    
    const handleAddIcon = useCallback((svgDataUri: string) => {
        const iconNodeId = `icon${nodeCounterRef.current++}`;
        const newNodeCode = `${iconNodeId}["<img src='${svgDataUri}' width='40' height='40' />"]`;
        const nodeStyleCode = `style ${iconNodeId} fill:transparent,stroke:none`;
    
        let updatedCode = code.trim();
        const diagramType = updatedCode.split('\n')[0]?.trim();
        const newLines = `\n  ${newNodeCode}\n  ${nodeStyleCode}`;
    
        if (!diagramType || (!diagramType.startsWith('graph') && !diagramType.startsWith('flowchart'))) {
            updatedCode = `flowchart TD${newLines}`;
        } else {
            updatedCode = `${updatedCode}${newLines}`;
        }
        
        onCodeChange(updatedCode);
        setIsIconPickerOpen(false);
        showToast(`Icon added to canvas.`, 'success');
    }, [code, onCodeChange, showToast]);

    const handleAddPicture = useCallback(() => {
        const newImageNodeId = `img${nodeCounterRef.current++}`;
        const defaultImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Flag_of_Argentina_%28civil%29.svg/330px-Flag_of_Argentina_%28civil%29.svg.png";
        const defaultTitle = "New Picture";
        const defaultWidth = 100;
        const defaultHeight = 60;

        const newNodeCode = `${newImageNodeId}["<img src='${defaultImageUrl}' width='${defaultWidth}' height='${defaultHeight}' /> ${defaultTitle}"]`;
        const nodeStyleCode = `style ${newImageNodeId} fill:transparent,stroke:none`;

        let updatedCode = code.trim();
        const diagramType = updatedCode.split('\n')[0]?.trim();
        const newLines = `\n  ${newNodeCode}\n  ${nodeStyleCode}`;

        if (!diagramType || (!diagramType.startsWith('graph') && !diagramType.startsWith('flowchart'))) {
            updatedCode = `flowchart TD${newLines}`;
        } else {
            updatedCode = `${updatedCode}${newLines}`;
        }
        
        onCodeChange(updatedCode);
        showToast(`Added a picture to the canvas.`, 'success');
    }, [code, onCodeChange, showToast]);

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
        <div ref={containerRef} className="flex h-full">
            <main 
                className="bg-gray-800 rounded-lg shadow-lg flex flex-col relative overflow-hidden"
                style={{ width: `calc(100% - ${sidebarSize}% - 8px)` }}
            >
                 <div className="flex-shrink-0 bg-gray-700 p-2 px-4 flex justify-between items-center rounded-t-lg">
                    <h3 className="text-sm font-semibold text-gray-300">Flowchart Canvas</h3>
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
                            onClick={() => setIsIconPickerOpen(true)}
                            aria-label="Add Vector Icon"
                            iconName="palette"
                            tooltipText="Add Vector Icon"
                        />
                        <TooltipButton
                            onClick={handleAddPicture}
                            aria-label="Add Picture"
                            iconName="image"
                            tooltipText="Add Picture"
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

                <IconPickerModal
                    isOpen={isIconPickerOpen}
                    onClose={() => setIsIconPickerOpen(false)}
                    onAddIcon={handleAddIcon}
                />

                <MoveToSubgraphModal
                    isOpen={isMoveToSubgraphModalOpen}
                    onClose={() => setIsMoveToSubgraphModalOpen(false)}
                    subgraphs={diagramObjects.subgraphs}
                    onMove={(target) => {
                        // This will be handled by the formatting panel now
                    }}
                />

                <ConfirmationModal
                    isOpen={confirmationState.isOpen}
                    onClose={confirmationState.onClose}
                    onConfirm={confirmationState.onConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    confirmText={confirmationState.confirmText}
                    cancelText={confirmationState.cancelText}
                    confirmButtonClass={confirmationState.confirmButtonClass}
                    onSecondaryAction={confirmationState.onSecondaryAction}
                    secondaryActionText={confirmationState.secondaryActionText}
                    secondaryActionButtonClass={confirmationState.secondaryActionButtonClass}
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
                aria-label="Resize sidebar"
            />
             
            <FlowchartSidebar
                sidebarSize={sidebarSize}
                code={code}
                onCodeChange={onCodeChange}
                theme={theme}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
                diagramObjects={diagramObjects}
                onOpenMoveToSubgraphModal={() => setIsMoveToSubgraphModalOpen(true)}
                onDeleteObject={handleDeleteSelectedObject}
                onPendingSelection={setPendingSelection}
            />
        </div>
    );
};
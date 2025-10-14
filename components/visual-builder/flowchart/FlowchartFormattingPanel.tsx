import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ThemeName, DiagramObject } from '../../../types';
import { Icon } from '../../Icon';
import { Button } from '../../Button';
import { ColorPicker } from '../../ColorPicker';
import type { SelectedObject } from './helpers';
import { 
    parseNodeStyle,
    parseLinkStyle,
    parseNodeDefinition,
    parseImageNode,
    parseLinkLine,
    getAllLinks,
    formatNodeId
} from './helpers';

interface FormattingPanelProps {
    onClose: () => void;
    code: string;
    selectedObject: SelectedObject;
    linkIndex: number;
    onCodeChange: (newCode: string) => void;
    theme: ThemeName;
    subgraphs: DiagramObject[];
    onOpenMoveToSubgraphModal: () => void;
    isInSubgraph: boolean;
    onRemoveFromSubgraph: () => void;
    onDeleteObject: () => void;
    onUpdateLink: (newLinkDef: { arrow?: string; text?: string }) => void;
    onSwapLinkDirection: () => void;
}

const ColorSwatchButton: React.FC<{ label: string; color?: string; onClick: () => void; }> = ({ label, color, onClick }) => (
    <div className="flex-1">
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <button onClick={onClick} className="w-full bg-gray-900 rounded-md p-1.5 text-sm text-white flex items-center gap-2 hover:bg-gray-700 transition-colors">
            <span className="w-5 h-5 rounded border border-gray-600" style={{ backgroundColor: color || 'transparent' }}></span>
            <span className="truncate">{color || 'Default'}</span>
        </button>
    </div>
);

const ImageFormatControls: React.FC<{
    imageInfo: { src: string; width?: string; height?: string; title?: string };
    onLabelChange: (newLabel: string) => void;
}> = ({ imageInfo, onLabelChange }) => {
    const [values, setValues] = useState(imageInfo);

    useEffect(() => {
        setValues(imageInfo);
    }, [imageInfo]);

    const handleChange = (field: keyof typeof values, value: string) => {
        const newValues = { ...values, [field]: value };
        setValues(newValues);

        let attrs = `src='${newValues.src}'`;
        if (newValues.width) attrs += ` width='${newValues.width}'`;
        if (newValues.height) attrs += ` height='${newValues.height}'`;
        
        const newLabel = `<img ${attrs} /> ${newValues.title || ''}`;
        onLabelChange(newLabel);
    };

    return (
        <div className="space-y-4">
             <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                <input 
                    type="text"
                    value={values.src || ''} 
                    onChange={e => handleChange('src', e.target.value)}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                    placeholder="https://example.com/image.png"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                <input 
                    type="text"
                    value={values.title || ''} 
                    onChange={e => handleChange('title', e.target.value)}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                    placeholder="Image title text"
                />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Width</label>
                    <input
                        type="text"
                        value={values.width || ''}
                        onChange={e => handleChange('width', e.target.value)}
                        className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                        placeholder="e.g., 100"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Height</label>
                    <input
                        type="text"
                        value={values.height || ''}
                        onChange={e => handleChange('height', e.target.value)}
                        className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                        placeholder="e.g., 60"
                    />
                </div>
            </div>
        </div>
    );
};

const NodeFormatControls: React.FC<{
    styles: Record<string, string>,
    label: string,
    onStyleChange: (key: string, value: string | null) => void,
    onLabelChange: (newLabel: string) => void,
}> = ({ styles, label, onStyleChange, onLabelChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [activeColorPicker, setActiveColorPicker] = useState<'color' | 'fill' | 'stroke' | null>(null);

    const imageInfo = useMemo(() => parseImageNode(label), [label]);

    const insertMarkdown = (markdown: string) => {
        if (!textareaRef.current) return;
        const { selectionStart, selectionEnd, value } = textareaRef.current;
        const selectedText = value.substring(selectionStart, selectionEnd);
        const newText = `${value.substring(0, selectionStart)}${markdown}${selectedText}${markdown}${value.substring(selectionEnd)}`;
        onLabelChange(newText);
    };

    const toggleColorPicker = (type: 'color' | 'fill' | 'stroke') => {
        setActiveColorPicker(prev => prev === type ? null : type);
    };

    return (
        <div className="space-y-4">
            {imageInfo.isImage ? (
                <ImageFormatControls imageInfo={imageInfo} onLabelChange={onLabelChange} />
            ) : (
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Text</label>
                    <div className="relative">
                        <textarea ref={textareaRef} value={label} onChange={(e) => onLabelChange(e.target.value)} rows={2} className="w-full bg-gray-900 text-white rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        <div className="absolute top-1 right-1 flex gap-1">
                            <Button onClick={() => insertMarkdown('**')} className="!p-1 !text-xs" title="Bold"><Icon name="bold" className="w-3 h-3"/></Button>
                            <Button onClick={() => insertMarkdown('_')} className="!p-1 !text-xs" title="Italic"><Icon name="italic" className="w-3 h-3"/></Button>
                        </div>
                    </div>
                </div>
            )}
            
            {!imageInfo.isImage && (
                <>
                    <div className="flex gap-2">
                        <ColorSwatchButton label="Text Color" color={styles.color} onClick={() => toggleColorPicker('color')} />
                        <ColorSwatchButton label="Background" color={styles.fill} onClick={() => toggleColorPicker('fill')} />
                    </div>

                    {activeColorPicker && (activeColorPicker === 'color' || activeColorPicker === 'fill') && (
                        <div className="bg-gray-900/70 p-3 rounded-md">
                            <h5 className="text-xs font-semibold text-gray-300 mb-2 capitalize">{activeColorPicker === 'color' ? 'Text' : 'Background'} Color</h5>
                            <ColorPicker color={styles[activeColorPicker]} onChange={c => onStyleChange(activeColorPicker, c)} />
                        </div>
                    )}
                </>
            )}

            <div>
                <h4 className="text-xs font-medium text-gray-400 mb-2 border-t border-gray-700 pt-2">Border</h4>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                         <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Width (px)</label>
                            <input
                                type="number"
                                min="0"
                                value={styles['stroke-width']?.replace('px','') || '1'}
                                onChange={e => onStyleChange('stroke-width', `${e.target.value}px`)}
                                className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Style</label>
                            <select 
                                value={styles['stroke-dasharray'] ? 'dashed' : 'solid'}
                                onChange={e => onStyleChange('stroke-dasharray', e.target.value === 'dashed' ? '5 5' : null)}
                                className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                         <ColorSwatchButton label="Color" color={styles.stroke} onClick={() => toggleColorPicker('stroke')} />
                    </div>
                </div>
                 {activeColorPicker === 'stroke' && (
                    <div className="bg-gray-900/70 p-3 rounded-md mt-2">
                        <h5 className="text-xs font-semibold text-gray-300 mb-2">Border Color</h5>
                        <ColorPicker color={styles.stroke} onChange={c => onStyleChange('stroke', c)} />
                    </div>
                )}
            </div>
        </div>
    );
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

const LinkFormatControls: React.FC<{
    styles: Record<string, string>,
    onStyleChange: (key: string, value: string | null) => void,
    onUpdateLink: (newLinkDef: { arrow?: string; text?: string }) => void;
    onSwapLinkDirection: () => void;
    code: string,
    linkIndex: number,
}> = ({ styles, onStyleChange, onUpdateLink, onSwapLinkDirection, code, linkIndex }) => {
    const [activeColorPicker, setActiveColorPicker] = useState<'stroke' | null>(null);

    const {arrow: currentArrow, text: currentText} = useMemo(() => {
        if (linkIndex === -1) return { arrow: '---', text: '' };
        const allLinks = getAllLinks(code);
        if (linkIndex >= allLinks.length) return { arrow: '---', text: '' };
        const link = allLinks[linkIndex];
        return link ? parseLinkLine(link.line) : { arrow: '---', text: '' };
    }, [code, linkIndex]);

    return (
        <div className="space-y-4">
             <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Text</label>
                <input
                    type="text"
                    value={currentText}
                    onChange={(e) => onUpdateLink({ text: e.target.value })}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                    placeholder="Optional link text..."
                />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Line Type</label>
                    <select 
                        value={currentArrow}
                        onChange={e => onUpdateLink({ arrow: e.target.value })}
                        disabled={!!currentText}
                        className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"
                        title={currentText ? "Cannot change arrow type when text is present" : "Select line type"}
                        >
                        {LINK_TYPES.map(link => <option key={link.value} value={link.value}>{link.label}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Direction</label>
                     <Button onClick={onSwapLinkDirection} className="w-full !bg-gray-700 hover:!bg-gray-600 !font-normal">
                        <Icon name="swap" className="w-4 h-4 mr-2"/>
                        Swap
                    </Button>
                </div>
            </div>
             <div>
                <h4 className="text-xs font-medium text-gray-400 mb-2 border-t border-gray-700 pt-2">Line Style</h4>
                <div className="flex flex-col gap-2">
                     <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Width (px)</label>
                            <input
                                type="number"
                                min="0"
                                value={styles['stroke-width']?.replace('px','') || '1'}
                                onChange={e => onStyleChange('stroke-width', `${e.target.value}px`)}
                                className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Style</label>
                            <select 
                                value={styles['stroke-dasharray'] ? 'dashed' : 'solid'}
                                onChange={e => onStyleChange('stroke-dasharray', e.target.value === 'dashed' ? '5, 5' : null)}
                                className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <ColorSwatchButton label="Color" color={styles.stroke} onClick={() => setActiveColorPicker(prev => prev ? null : 'stroke')} />
                    </div>
                </div>
                 {activeColorPicker === 'stroke' && (
                    <div className="bg-gray-900/70 p-3 rounded-md mt-2">
                        <h5 className="text-xs font-semibold text-gray-300 mb-2">Line Color</h5>
                        <ColorPicker color={styles.stroke} onChange={c => onStyleChange('stroke', c)} />
                    </div>
                )}
            </div>
        </div>
    );
}

export const FlowchartFormattingPanel: React.FC<FormattingPanelProps> = ({ onClose, code, selectedObject, linkIndex, onCodeChange, theme, subgraphs, onOpenMoveToSubgraphModal, isInSubgraph, onRemoveFromSubgraph, onDeleteObject, onUpdateLink, onSwapLinkDirection }) => {
    const [styles, setStyles] = useState<Record<string, string>>({});
    const [label, setLabel] = useState('');
    
    const mermaidId = useMemo(() => formatNodeId(selectedObject.id), [selectedObject.id]);

    const updateCode = useCallback((updates: { styles?: Record<string, string>, label?: string }) => {
        let currentCode = code;

        // Handle Label Changes (for nodes/subgraphs)
        if (updates.label !== undefined && selectedObject.type !== 'edge') {
            const newLabel = updates.label;
            const def = parseNodeDefinition(currentCode, mermaidId);
            if (def) {
                let newDefLine = def.fullLine;
                const advancedLabelRegex = /(label\s*:\s*[`"])(.*?)([`"])/;
                const classicLabelRegex = /(\[|\(|\{)(?:[`"]?)([\s\S]*?)(?:[`"]?)(\]|\)|\})/;

                if (def.type === 'advanced' && def.fullLine.match(advancedLabelRegex)) {
                    newDefLine = def.fullLine.replace(advancedLabelRegex, `$1${newLabel}$3`);
                } else if (def.type === 'classic' && def.fullLine.match(classicLabelRegex)) {
                    newDefLine = def.fullLine.replace(classicLabelRegex, `$1"${newLabel}"$3`);
                } else if (def.type === 'id-only') {
                    newDefLine = `${def.fullLine.trim()}["${newLabel}"]`;
                }
                
                if (newDefLine !== def.fullLine) {
                    currentCode = currentCode.replace(def.fullLine, newDefLine);
                }
            }
        }

        // Handle Style Changes (for all types)
        if (updates.styles) {
            const newStyles = updates.styles;
            const styleString = Object.entries(newStyles)
                .map(([key, value]) => `${key}:${value}`)
                .join(',');

            if (selectedObject.type === 'edge') {
                const styleRegex = new RegExp(`^\\s*linkStyle\\s+${linkIndex}[\\s\\S]*?$`, 'm');
                 const existingStyleLine = currentCode.match(styleRegex);
                 if (existingStyleLine) {
                    if (styleString) {
                        currentCode = currentCode.replace(styleRegex, `linkStyle ${linkIndex} ${styleString}`);
                    } else {
                        currentCode = currentCode.split('\n').filter(line => line.trim() !== existingStyleLine[0].trim()).join('\n');
                    }
                 } else if (styleString) {
                    currentCode = `${currentCode.trim()}\nlinkStyle ${linkIndex} ${styleString}`;
                 }
            } else { // node or subgraph
                const styleRegex = new RegExp(`^\\s*style\\s+${mermaidId}[\\s\\S]*?$`, 'm');
                const existingStyleLine = currentCode.match(styleRegex);

                if (existingStyleLine) {
                    if (styleString) {
                        currentCode = currentCode.replace(styleRegex, `style ${mermaidId} ${styleString}`);
                    } else {
                        currentCode = currentCode.split('\n').filter(line => line.trim() !== existingStyleLine[0].trim()).join('\n');
                    }
                } else if (styleString) {
                    currentCode = `${currentCode.trim()}\nstyle ${mermaidId} ${styleString}`;
                }
            }
        }
        
        onCodeChange(currentCode.replace(/\n\n+/g, '\n').trim());
    }, [code, mermaidId, selectedObject.type, onCodeChange, linkIndex]);

    useEffect(() => {
        if (selectedObject.type === 'edge') {
            setStyles(parseLinkStyle(code, linkIndex));
            setLabel('');
        } else {
            const initialStyles = parseNodeStyle(code, mermaidId);
            setStyles(initialStyles);
            const def = parseNodeDefinition(code, mermaidId);
            setLabel(def?.label || '');
        }
    }, [selectedObject, mermaidId, code, linkIndex]);
    
    const handleStyleChange = (key: string, value: string | null) => {
        const newStyles = { ...styles };
        if (value === null || value === '') {
            delete newStyles[key];
        } else {
            newStyles[key] = value;
        }
        setStyles(newStyles);
        updateCode({ styles: newStyles });
    };

    const handleLabelChange = (newLabel: string) => {
        setLabel(newLabel);
        updateCode({ label: newLabel });
    };
    
    return (
        <div className="pt-2 text-sm flex flex-col h-full">
            <div className="p-2 flex justify-between items-center rounded-t-lg flex-shrink-0">
                <h3 className="text-sm font-bold text-white uppercase ml-2 flex items-center gap-2">
                    <Icon name="palette" className="w-4 h-4" />
                    Properties
                </h3>
                <Button onClick={onClose} className="!p-1 !bg-transparent hover:!bg-gray-600">
                    <Icon name="x" className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto px-4 pb-4 space-y-4">
                {selectedObject.type === 'node' && (
                    <div className="pb-4 border-b border-gray-700 space-y-2">
                         {isInSubgraph && (
                             <Button
                                onClick={onRemoveFromSubgraph}
                                className="w-full !justify-start !text-sm !font-normal !bg-gray-700 hover:!bg-gray-600"
                            >
                                <Icon name="move-to-folder" className="w-4 h-4 mr-2 rotate-180"/>
                                Remove from Subgraph
                            </Button>
                         )}
                        <Button
                            onClick={onOpenMoveToSubgraphModal}
                            disabled={subgraphs.length === 0}
                            className="w-full !justify-start !text-sm !font-normal !bg-gray-700 hover:!bg-gray-600"
                        >
                            <Icon name="move-to-folder" className="w-4 h-4 mr-2" />
                            Move to Subgraph...
                        </Button>
                        {subgraphs.length === 0 && !isInSubgraph && <p className="text-xs text-gray-500 mt-1 text-center">No subgraphs to move to.</p>}
                    </div>
                )}
                
                <div>
                    { (selectedObject.type === 'node' || selectedObject.type === 'subgraph') && 
                        <NodeFormatControls styles={styles} label={label} onStyleChange={handleStyleChange} onLabelChange={handleLabelChange} />
                    }
                    
                     { selectedObject.type === 'edge' && 
                        <LinkFormatControls 
                            styles={styles} 
                            onStyleChange={handleStyleChange}
                            onUpdateLink={onUpdateLink}
                            onSwapLinkDirection={onSwapLinkDirection}
                            code={code}
                            linkIndex={linkIndex}
                        />
                    }
                </div>
            </div>
             <div className="p-4 mt-auto flex-shrink-0 border-t border-gray-700">
                <Button 
                    onClick={onDeleteObject}
                    className="w-full !bg-red-600/80 hover:!bg-red-600"
                >
                    <Icon name="trash" className="w-4 h-4 mr-2"/>
                    Delete Object
                </Button>
            </div>
        </div>
    );
};
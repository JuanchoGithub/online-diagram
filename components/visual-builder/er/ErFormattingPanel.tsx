import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../Icon';
import { Button } from '../../Button';
import type { SelectedObject } from './helpers';
import { ErEntity, ErRelationship, ErAttribute, updateEntity, addAttribute, updateAttribute, deleteAttribute, updateRelationship } from './helpers';

interface FormattingPanelProps {
    onClose: () => void;
    code: string;
    selectedObject: SelectedObject;
    itemData: ErEntity | ErRelationship;
    onCodeChange: (newCode: string) => void;
    onDeleteObject: () => void;
}

const CARDINALITY_MAP: Record<string, string> = {
    '|o': 'Zero or one',
    '||': 'Exactly one',
    '}o': 'Zero or more',
    '}|': 'One or more',
};

const REVERSE_CARDINALITY_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(CARDINALITY_MAP).map(([key, value]) => [value, key])
);

const EntityFormatControls: React.FC<{
    entity: ErEntity;
    code: string;
    onCodeChange: (newCode: string) => void;
}> = ({ entity, code, onCodeChange }) => {
    const [name, setName] = useState(entity.name);
    const [attributes, setAttributes] = useState(entity.attributes);

    useEffect(() => {
        setAttributes(entity.attributes);
    }, [entity.attributes]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (name !== entity.name) {
                const newCode = updateEntity(code, entity.name, name);
                onCodeChange(newCode);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [name, entity.name, code, onCodeChange]);

    const handleAddAttribute = () => {
        const newCode = addAttribute(code, name, { type: 'string', name: 'newAttribute', keys: [] });
        onCodeChange(newCode);
    };

    const handleAttributeChange = (index: number, updates: Partial<ErAttribute>) => {
        const oldAttribute = attributes[index];
        const newAttribute = { ...oldAttribute, ...updates };
        const newCode = updateAttribute(code, name, oldAttribute.name, newAttribute);
        onCodeChange(newCode);
    };
    
    const handleAttributeKeyChange = (index: number, key: 'PK' | 'FK' | 'UK') => {
        const oldAttribute = attributes[index];
        const newKeys = oldAttribute.keys.includes(key) 
            ? oldAttribute.keys.filter(k => k !== key)
            : [...oldAttribute.keys, key];
        handleAttributeChange(index, { keys: newKeys });
    };

    const handleDeleteAttribute = (attrName: string) => {
        const newCode = deleteAttribute(code, name, attrName);
        onCodeChange(newCode);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Entity Name</label>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                />
            </div>
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium text-gray-400">Attributes</label>
                    <Button onClick={handleAddAttribute} className="!px-2 !py-1 !text-xs">
                        <Icon name="add" className="w-3 h-3 mr-1"/> Add
                    </Button>
                </div>
                <div className="space-y-2 bg-gray-900/50 p-2 rounded-md">
                    {attributes.length === 0 && <p className="text-xs text-gray-500 text-center p-2">No attributes defined.</p>}
                    {attributes.map((attr, index) => (
                        <div key={attr.id} className="bg-gray-700 p-2 rounded-md space-y-2">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={attr.type}
                                    onChange={(e) => handleAttributeChange(index, { type: e.target.value })}
                                    placeholder="type"
                                    className="w-1/3 bg-gray-900 text-white rounded-md p-1 text-xs"
                                />
                                <input
                                    type="text"
                                    value={attr.name}
                                    onChange={(e) => handleAttributeChange(index, { name: e.target.value })}
                                    placeholder="name"
                                    className="flex-grow bg-gray-900 text-white rounded-md p-1 text-xs"
                                />
                                <Button onClick={() => handleDeleteAttribute(attr.name)} className="!p-1 !bg-transparent hover:!bg-red-600/50">
                                    <Icon name="trash" className="w-3 h-3"/>
                                </Button>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                {(['PK', 'FK', 'UK'] as const).map(key => (
                                    <label key={key} className="flex items-center gap-1 text-xs text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={attr.keys.includes(key)}
                                            onChange={() => handleAttributeKeyChange(index, key)}
                                            className="w-3 h-3 bg-gray-900 border-gray-600 rounded text-indigo-500 focus:ring-indigo-600"
                                        />
                                        {key}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RelationshipFormatControls: React.FC<{
    relationship: ErRelationship;
    code: string;
    onCodeChange: (newCode: string) => void;
}> = ({ relationship, code, onCodeChange }) => {
    
    const handleUpdate = useCallback((updates: Partial<ErRelationship>) => {
        const newCode = updateRelationship(code, relationship.lineIndex, updates);
        onCodeChange(newCode);
    }, [code, onCodeChange, relationship.lineIndex]);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Label</label>
                <input
                    type="text"
                    value={relationship.label}
                    onChange={(e) => handleUpdate({ label: e.target.value })}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                />
            </div>
             <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400">{relationship.entity1} Cardinality</label>
                 <select 
                    value={CARDINALITY_MAP[relationship.cardinality1]}
                    onChange={e => handleUpdate({ cardinality1: REVERSE_CARDINALITY_MAP[e.target.value] })}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {Object.values(CARDINALITY_MAP).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400">{relationship.entity2} Cardinality</label>
                 <select 
                    value={CARDINALITY_MAP[relationship.cardinality2]}
                    onChange={e => handleUpdate({ cardinality2: REVERSE_CARDINALITY_MAP[e.target.value] })}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {Object.values(CARDINALITY_MAP).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
             <div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                        type="checkbox"
                        checked={relationship.identification === '--'}
                        onChange={(e) => handleUpdate({ identification: e.target.checked ? '--' : '..' })}
                        className="w-4 h-4 bg-gray-900 border-gray-600 rounded text-indigo-500 focus:ring-indigo-600"
                    />
                    Identifying Relationship
                </label>
            </div>
        </div>
    );
};

export const ErFormattingPanel: React.FC<FormattingPanelProps> = ({ onClose, code, selectedObject, itemData, onCodeChange, onDeleteObject }) => {
    
    const typeLabel = selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1);

    return (
        <div className="pt-2 text-sm flex flex-col h-full">
            <div className="p-2 flex justify-between items-center rounded-t-lg flex-shrink-0">
                <h3 className="text-sm font-bold text-white uppercase ml-2 flex items-center gap-2">
                    <Icon name="palette" className="w-4 h-4" />
                    {typeLabel} Properties
                </h3>
                <Button onClick={onClose} className="!p-1 !bg-transparent hover:!bg-gray-600">
                    <Icon name="x" className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto px-4 pb-4 space-y-4">
                { selectedObject.type === 'entity' && 
                    <EntityFormatControls entity={itemData as ErEntity} code={code} onCodeChange={onCodeChange} />
                }
                { selectedObject.type === 'relationship' && 
                    <RelationshipFormatControls relationship={itemData as ErRelationship} code={code} onCodeChange={onCodeChange} />
                }
            </div>
            <div className="p-4 mt-auto flex-shrink-0 border-t border-gray-700">
                <Button 
                    onClick={onDeleteObject}
                    className="w-full !bg-red-600/80 hover:!bg-red-600"
                >
                    <Icon name="trash" className="w-4 h-4 mr-2"/>
                    Delete {typeLabel}
                </Button>
            </div>
        </div>
    );
};
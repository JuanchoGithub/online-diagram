import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../Icon';
import { Button } from '../../Button';
import { SelectedObject } from './SequenceSidebar';
import { Participant, Message, updateParticipant, updateMessage } from './helpers';

interface FormattingPanelProps {
    onClose: () => void;
    code: string;
    selectedObject: SelectedObject;
    itemData: Participant | Message;
    onCodeChange: (newCode: string) => void;
    onDeleteObject: () => void;
}

const PARTICIPANT_TYPES = [
    { label: 'Participant', value: 'participant' },
    { label: 'Actor', value: 'actor' },
    { label: 'Boundary', value: 'boundary' },
    { label: 'Control', value: 'control' },
    { label: 'Entity', value: 'entity' },
    { label: 'Database', value: 'database' },
    { label: 'Collections', value: 'collections' },
    { label: 'Queue', value: 'queue' },
];

const MESSAGE_ARROW_TYPES = [
    { label: 'Sync (Solid)', value: '->>' },
    { label: 'Reply (Dashed)', value: '-->>' },
    { label: 'Async (Open)', value: '->' },
    { label: 'Async Reply', value: '--)' },
    { label: 'Lost (Cross)', value: '-x' },
    { label: 'Lost Reply (Cross)', value: '--x' },
];

const ParticipantFormatControls: React.FC<{
    participant: Participant;
    onUpdate: (updates: Partial<Participant>) => void;
}> = ({ participant, onUpdate }) => {
    const [label, setLabel] = useState(participant.label);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (label !== participant.label) {
                onUpdate({ label });
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [label, participant.label, onUpdate]);
    
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Label</label>
                <input 
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                <select 
                    value={participant.type}
                    onChange={e => onUpdate({ type: e.target.value })}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {PARTICIPANT_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                </select>
            </div>
        </div>
    );
};

const MessageFormatControls: React.FC<{
    message: Message;
    onUpdate: (updates: Partial<Message>) => void;
}> = ({ message, onUpdate }) => {
    const [text, setText] = useState(message.text);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (text !== message.text) {
                onUpdate({ text });
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [text, message.text, onUpdate]);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Text</label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm"
                    placeholder="Message text..."
                />
            </div>
             <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">Arrow Type</label>
                <select 
                    value={message.arrow}
                    onChange={e => onUpdate({ arrow: e.target.value })}
                    className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                    {MESSAGE_ARROW_TYPES.map(link => <option key={link.value} value={link.value}>{link.label}</option>)}
                </select>
            </div>
        </div>
    );
};

export const SequenceFormattingPanel: React.FC<FormattingPanelProps> = ({ onClose, code, selectedObject, itemData, onCodeChange, onDeleteObject }) => {
    
    const handleUpdate = useCallback((updates: Partial<Participant> | Partial<Message>) => {
        let newCode = code;
        if (selectedObject.type === 'participant') {
            newCode = updateParticipant(code, (itemData as Participant).alias, updates as Partial<Participant>);
        } else if (selectedObject.type === 'message') {
            newCode = updateMessage(code, (itemData as Message).lineIndex, updates as Partial<Message>);
        }
        onCodeChange(newCode);
    }, [code, onCodeChange, selectedObject, itemData]);
    
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
                { selectedObject.type === 'participant' && 
                    <ParticipantFormatControls participant={itemData as Participant} onUpdate={handleUpdate} />
                }
                { selectedObject.type === 'message' && 
                    <MessageFormatControls message={itemData as Message} onUpdate={handleUpdate} />
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

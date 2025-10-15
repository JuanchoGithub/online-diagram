import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../Icon';
import { Button } from '../../Button';
import type { SelectedObject, Participant, Message, Note, Box, Fragment, Activation } from './helpers';
import { updateParticipant, updateMessage, updateNote, updateBox, updateFragment, addMessageToFragment } from './helpers';

interface FormattingPanelProps {
    onClose: () => void;
    code: string;
    selectedObject: SelectedObject;
    itemData: Participant | Message | Note | Box | Fragment | Activation;
    allParticipants: Participant[];
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
    { label: 'Async Reply (Dashed)', value: '--)' },
    { label: 'Lost (Cross)', value: '-x' },
    { label: 'Lost Reply (Cross)', value: '--x' },
];

const CheckboxList: React.FC<{
    options: { label: string, value: string }[],
    selected: string[],
    onChange: (selected: string[]) => void,
    maxHeight?: string
}> = ({ options, selected, onChange, maxHeight = '100px' }) => {
    const handleToggle = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter(v => v !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    return (
        <div className="bg-gray-900/50 p-2 rounded-md space-y-1 overflow-y-auto" style={{ maxHeight }}>
            {options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 p-1 rounded hover:bg-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selected.includes(opt.value)}
                        onChange={() => handleToggle(opt.value)}
                        className="w-4 h-4 bg-gray-900 border-gray-600 rounded text-indigo-500 focus:ring-indigo-600"
                    />
                    <span className="text-sm text-gray-300">{opt.label}</span>
                </label>
            ))}
        </div>
    );
};

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

const NoteFormatControls: React.FC<{
    note: Note;
    allParticipants: Participant[];
    onUpdate: (updates: Partial<Note> & { position?: string }) => void;
}> = ({ note, allParticipants, onUpdate }) => {
    const [text, setText] = useState(note.text);
    
    useEffect(() => {
        const handler = setTimeout(() => { if (text !== note.text) onUpdate({ text }); }, 500);
        return () => clearTimeout(handler);
    }, [text, note.text, onUpdate]);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Text</label>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={3} className="w-full bg-gray-900 text-white rounded-md p-2 text-sm" />
            </div>
             <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Position</label>
                <div className="flex gap-2">
                    {['left of', 'right of', 'over'].map(pos => (
                         <Button key={pos} onClick={() => onUpdate({ position: pos })} className={`flex-1 !font-normal ${note.position === pos ? '' : '!bg-gray-700 hover:!bg-gray-600'}`}>{pos}</Button>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Participants</label>
                <CheckboxList
                    options={allParticipants.map(p => ({ label: p.label, value: p.alias }))}
                    selected={note.over}
                    onChange={selected => onUpdate({ over: selected })}
                />
             </div>
        </div>
    );
};

const BoxFormatControls: React.FC<{
    box: Box;
    allParticipants: Participant[];
    onUpdate: (updates: Partial<Box>) => void;
}> = ({ box, allParticipants, onUpdate }) => {
    const [title, setTitle] = useState(box.text);

    useEffect(() => {
        const handler = setTimeout(() => { if (title !== box.text) onUpdate({ title }); }, 500);
        return () => clearTimeout(handler);
    }, [title, box.text, onUpdate]);
    
    return (
         <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm" />
            </div>
             <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Contained Participants</label>
                 <CheckboxList
                    options={allParticipants.map(p => ({ label: p.label, value: p.alias }))}
                    selected={box.participants}
                    onChange={selected => onUpdate({ participants: selected })}
                    maxHeight='150px'
                />
            </div>
        </div>
    );
};

const FragmentFormatControls: React.FC<{
    fragment: Fragment;
    allParticipants: Participant[];
    onUpdate: (updates: { text: string }) => void;
    onAddMessage: (message: { from: string, to: string, text: string, arrow: string }) => void;
}> = ({ fragment, allParticipants, onUpdate, onAddMessage }) => {
    const [text, setText] = useState(fragment.text);
    const [showAddMessage, setShowAddMessage] = useState(false);
    const [newMessage, setNewMessage] = useState({
        from: allParticipants[0]?.alias || '',
        to: allParticipants[1]?.alias || allParticipants[0]?.alias || '',
        text: 'New Action',
        arrow: '->>'
    });

    useEffect(() => {
        const handler = setTimeout(() => { if (text !== fragment.text) onUpdate({ text }); }, 500);
        return () => clearTimeout(handler);
    }, [text, fragment.text, onUpdate]);
    
    const handleAdd = () => {
        onAddMessage(newMessage);
        setShowAddMessage(false);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Condition / Text</label>
                <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm" />
            </div>
            <div className="border-t border-gray-700 pt-4">
                {!showAddMessage && <Button onClick={() => setShowAddMessage(true)} className="w-full !font-normal !bg-gray-700 hover:!bg-gray-600"><Icon name="add" className="w-4 h-4 mr-2" />Add Message to Fragment</Button>}
                {showAddMessage && (
                    <div className="space-y-2 bg-gray-900/50 p-3 rounded-md">
                        <h4 className="text-xs font-semibold text-gray-300 mb-2">New Message</h4>
                        <div className="flex gap-2">
                             <select value={newMessage.from} onChange={e => setNewMessage(m => ({...m, from: e.target.value}))} className="flex-1 bg-gray-900 text-white rounded-md p-1.5 text-sm">
                                {allParticipants.map(p => <option key={p.alias} value={p.alias}>{p.label}</option>)}
                            </select>
                            <select value={newMessage.to} onChange={e => setNewMessage(m => ({...m, to: e.target.value}))} className="flex-1 bg-gray-900 text-white rounded-md p-1.5 text-sm">
                                {allParticipants.map(p => <option key={p.alias} value={p.alias}>{p.label}</option>)}
                            </select>
                        </div>
                        <input type="text" value={newMessage.text} onChange={e => setNewMessage(m => ({...m, text: e.target.value}))} className="w-full bg-gray-900 text-white rounded-md p-1.5 text-sm" />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button onClick={() => setShowAddMessage(false)} className="!bg-gray-600 hover:!bg-gray-500">Cancel</Button>
                            <Button onClick={handleAdd}>Add</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const SequenceFormattingPanel: React.FC<FormattingPanelProps> = ({ onClose, code, selectedObject, itemData, allParticipants, onCodeChange, onDeleteObject }) => {
    
    const handleUpdate = useCallback((updates: any) => {
        let newCode = code;
        switch(selectedObject.type) {
            case 'participant':
                newCode = updateParticipant(code, (itemData as Participant).alias, updates as Partial<Participant>);
                break;
            case 'message':
                 newCode = updateMessage(code, (itemData as Message).lineIndex, updates as Partial<Message>);
                break;
            case 'note':
                newCode = updateNote(code, (itemData as Note).lineIndex, updates as Partial<Note>);
                break;
            case 'box':
                newCode = updateBox(code, itemData as Box, updates as Partial<Box>);
                break;
            case 'fragment':
                newCode = updateFragment(code, (itemData as Fragment).startLine, updates.text);
                break;
        }
        onCodeChange(newCode);
    }, [code, onCodeChange, selectedObject, itemData]);
    
    const handleAddMessageToFragment = useCallback((message: { from: string, to: string, text: string, arrow: string }) => {
        const newCode = addMessageToFragment(code, itemData as Fragment, message);
        onCodeChange(newCode);
    }, [code, onCodeChange, itemData]);
    
    const typeLabel = selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1);

    const renderControls = () => {
        switch(selectedObject.type) {
            case 'participant':
                return <ParticipantFormatControls participant={itemData as Participant} onUpdate={handleUpdate} />
            case 'message':
                 return <MessageFormatControls message={itemData as Message} onUpdate={handleUpdate} />
            case 'note':
                 return <NoteFormatControls note={itemData as Note} allParticipants={allParticipants} onUpdate={handleUpdate} />
            case 'box':
                return <BoxFormatControls box={itemData as Box} allParticipants={allParticipants} onUpdate={handleUpdate} />
            case 'fragment':
                return <FragmentFormatControls fragment={itemData as Fragment} allParticipants={allParticipants} onUpdate={handleUpdate} onAddMessage={handleAddMessageToFragment} />
            case 'activation':
                return <p className="text-gray-400 text-xs italic text-center p-4">Formatting for {typeLabel} is not yet available.</p>
            default:
                return null;
        }
    }

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
                {renderControls()}
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

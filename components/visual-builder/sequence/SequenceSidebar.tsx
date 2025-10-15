import React, { useState, useCallback, useMemo } from 'react';
import { CollapsibleObjectList } from '../shared/CollapsibleObjectList';
import { SequenceFormattingPanel } from './SequenceFormattingPanel';
// FIX: Import all required types from helpers
import { ParsedSequenceObjects, Participant, Message, SelectedObject, Note, Box, Fragment, Activation } from './helpers';

interface SequenceSidebarProps {
    sidebarSize: number;
    code: string;
    onCodeChange: (newCode: string) => void;
    selectedObject: SelectedObject | null;
    setSelectedObject: (obj: SelectedObject | null) => void;
    diagramObjects: ParsedSequenceObjects;
    onDeleteObject: () => void;
}

const participantIconMap: Record<string, string> = {
    actor: 'user',
    database: 'save', // Using 'save' icon for database
    boundary: 'circle',
    control: 'git-commit',
    entity: 'diamond',
};


export const SequenceSidebar: React.FC<SequenceSidebarProps> = (props) => {
    const { 
        sidebarSize, 
        code, 
        onCodeChange, 
        selectedObject, 
        setSelectedObject, 
        diagramObjects, 
        onDeleteObject,
    } = props;

    const [sidebarVerticalSplit, setSidebarVerticalSplit] = useState(50);
    const [isVerticalResizing, setIsVerticalResizing] = useState(false);
    const sidebarRef = React.useRef<HTMLElement>(null);

    const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsVerticalResizing(true);
    }, []);
    
    const handleSelectObject = (id: string, type: string) => {
        if (['message', 'participant', 'note', 'box', 'fragment', 'activation'].includes(type)) {
            setSelectedObject({ id, type: type as SelectedObject['type'] });
        } else {
            setSelectedObject(null);
        }
    };

    const participantsForList = useMemo(() => {
        return diagramObjects.participants.map(p => {
            const icon = participantIconMap[p.type];
            const isSpecial = !['participant', 'actor'].includes(p.type);
            
            return {
                ...p,
                label: isSpecial ? `${p.label} (${p.type})` : p.label,
                icon: icon,
            };
        });
    }, [diagramObjects.participants]);

    React.useEffect(() => {
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
    
    const selectedItemData = useMemo(() => {
        if (!selectedObject) return null;
        switch(selectedObject.type) {
            case 'participant':
                return diagramObjects.participants.find(p => p.id === selectedObject.id);
            case 'message':
                return diagramObjects.messages.find(m => m.id === selectedObject.id);
            case 'note':
                return diagramObjects.notes.find(n => n.id === selectedObject.id);
            case 'box':
                return diagramObjects.boxes.find(b => b.id === selectedObject.id);
            case 'fragment':
                return diagramObjects.fragments.find(f => f.id === selectedObject.id);
            case 'activation':
                return diagramObjects.activations.find(a => a.id === selectedObject.id);
            default:
                return null;
        }
    }, [selectedObject, diagramObjects]);

    return (
        <aside 
            ref={sidebarRef}
            className="bg-gray-800 rounded-lg flex flex-col"
            style={{ width: `${sidebarSize}%` }}
        >
            <div
                className="p-4 overflow-y-auto"
                style={{ height: selectedObject ? `${sidebarVerticalSplit}%` : '100%', flexShrink: 1, minHeight: 0 }}
            >
                <h3 className="text-base font-semibold text-white mb-4">Diagram Objects</h3>
                <CollapsibleObjectList title="Participants" objects={participantsForList} icon="square" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="participant" />
                <CollapsibleObjectList title="Messages" objects={diagramObjects.messages} icon="link" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="message" />
                <CollapsibleObjectList title="Activations" objects={diagramObjects.activations} icon="square" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="activation" defaultOpen={false} />
                <CollapsibleObjectList title="Boxes" objects={diagramObjects.boxes} icon="folder" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="box" />
                <CollapsibleObjectList title="Notes" objects={diagramObjects.notes} icon="note" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="note" />
                <CollapsibleObjectList title="Fragments" objects={diagramObjects.fragments} icon="alt" selectedId={selectedObject?.id ?? null} onSelect={handleSelectObject} type="fragment" />
            </div>
            
            {selectedObject && selectedItemData && (
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
                        <SequenceFormattingPanel
                            key={selectedObject.id} // Re-mount when selection changes
                            selectedObject={selectedObject}
                            itemData={selectedItemData as any}
                            allParticipants={diagramObjects.participants}
                            onClose={() => setSelectedObject(null)}
                            code={code}
                            onCodeChange={onCodeChange}
                            onDeleteObject={onDeleteObject}
                        />
                    </div>
                </>
            )}
        </aside>
    );
};
import React, { useState } from 'react';
import { Icon } from '../../Icon';
import type { DiagramObject } from '../../../types';

interface CollapsibleObjectListProps {
    title: string;
    objects: (DiagramObject & { icon?: string })[];
    icon: string;
    selectedId: string | null;
    onSelect: (id: string, type: string) => void;
    type: string;
    showId?: boolean;
    idFormatter?: (id: string) => string;
    defaultOpen?: boolean;
}

export const CollapsibleObjectList: React.FC<CollapsibleObjectListProps> = ({ 
    title, 
    objects, 
    icon, 
    selectedId, 
    onSelect, 
    type, 
    showId = false, 
    idFormatter = (id) => id, 
    defaultOpen = true 
}) => {
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
                                    onClick={() => onSelect(obj.id, type)}
                                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-3 ${
                                        selectedId === obj.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                                    title={obj.label}
                                >
                                    <Icon name={obj.icon || icon} className="w-4 h-4 flex-shrink-0" />
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
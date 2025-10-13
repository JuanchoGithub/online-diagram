import React from 'react';
import type { Diagram } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';

interface DiagramLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    diagrams: Diagram[];
    currentCode: string;
    currentDiagramId: string | null;
    onLoadDiagram: (diagram: Diagram) => void;
    onSaveDiagram: () => void;
    onNewDiagram: () => void;
    onDeleteDiagram: (id: string) => void;
}

export const DiagramLibrary: React.FC<DiagramLibraryProps> = ({
    isOpen,
    onClose,
    diagrams,
    currentDiagramId,
    onLoadDiagram,
    onSaveDiagram,
    onNewDiagram,
    onDeleteDiagram,
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-lg font-semibold text-white">Diagram Library</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 flex-grow overflow-y-auto">
                    {diagrams.length === 0 ? (
                        <p className="text-gray-500 text-center text-sm mt-4">No saved diagrams. Save one to get started!</p>
                    ) : (
                        <ul className="space-y-2">
                            {diagrams.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(d => (
                                <li key={d.id} className={`p-3 rounded-md transition-colors cursor-pointer flex justify-between items-center ${currentDiagramId === d.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`} onClick={() => onLoadDiagram(d)}>
                                    <div>
                                        <p className="font-semibold text-white truncate">{d.title}</p>
                                        <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteDiagram(d.id); }} className="text-gray-400 hover:text-red-500 p-1 rounded-full"><Icon name="delete" className="w-4 h-4"/></button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-end items-center gap-4 rounded-b-lg border-t border-gray-600">
                     <Button onClick={onNewDiagram}><Icon name="add" className="w-4 h-4 mr-1"/>New Diagram</Button>
                     <Button onClick={onSaveDiagram}><Icon name="save" className="w-4 h-4 mr-1"/>Save Current</Button>
                </div>
            </div>
        </div>
    );
};
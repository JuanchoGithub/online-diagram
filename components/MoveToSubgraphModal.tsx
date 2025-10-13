import React from 'react';
import type { DiagramObject } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';

interface MoveToSubgraphModalProps {
    isOpen: boolean;
    onClose: () => void;
    subgraphs: DiagramObject[];
    onMove: (subgraph: DiagramObject) => void;
}

export const MoveToSubgraphModal: React.FC<MoveToSubgraphModalProps> = ({ isOpen, onClose, subgraphs, onMove }) => {
    if (!isOpen) return null;

    const handleSelect = (subgraph: DiagramObject) => {
        onMove(subgraph);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[60vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-lg font-semibold text-white">Move Node to Subgraph</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 flex-grow overflow-y-auto">
                    {subgraphs.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <Icon name="folder" className="w-12 h-12 mx-auto mb-4 text-gray-600"/>
                            <p className="text-sm">No subgraphs available.</p>
                            <p className="text-xs mt-1">Create a subgraph on the canvas first.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-400 mb-4">Select a destination subgraph:</p>
                            <ul className="space-y-2">
                                {subgraphs.map(subgraph => (
                                    <li key={subgraph.id}>
                                        <button 
                                            onClick={() => handleSelect(subgraph)}
                                            className='w-full p-3 rounded-md transition-colors bg-gray-700 hover:bg-indigo-600 text-left flex items-center gap-3'
                                        >
                                            <Icon name="folder" className="w-5 h-5 text-indigo-400"/>
                                            <span className="font-semibold text-white truncate">{subgraph.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                 {/* Modal Footer */}
                <div className="flex-shrink-0 bg-gray-700 p-3 flex justify-end items-center gap-4 rounded-b-lg border-t border-gray-600">
                     <Button onClick={onClose} className="!bg-gray-600 hover:!bg-gray-500">Cancel</Button>
                </div>
            </div>
        </div>
    );
};
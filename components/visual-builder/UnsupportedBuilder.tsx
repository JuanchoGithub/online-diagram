import React from 'react';
import { Icon } from '../Icon';

interface UnsupportedBuilderProps {
    diagramType: string;
}

export const UnsupportedBuilder: React.FC<UnsupportedBuilderProps> = ({ diagramType }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 p-8 bg-gray-800 rounded-lg">
            <Icon name="visual" className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-300">Visual Builder Not Available</h2>
            <p className="mt-2 max-w-md">
                The Visual Builder does not currently support <strong>{diagramType}</strong> diagrams. Please use the Code Editor to make changes.
            </p>
        </div>
    );
};

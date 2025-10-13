import React from 'react';
import { CHART_EXAMPLES } from '../constants';

interface ChartSelectorProps {
    onSelect: (code: string) => void;
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({ onSelect }) => {
    
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = event.target.value;
        if (selectedCode) {
            onSelect(selectedCode);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg">
             <div className="flex-shrink-0 bg-gray-700 p-2 px-4 rounded-t-lg">
                <h3 className="text-sm font-semibold text-gray-300">Load a Template</h3>
            </div>
            <div className="p-4">
                <select 
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                >
                    <option value="">Select a chart type...</option>
                    {CHART_EXAMPLES.map(example => (
                        <option key={example.name} value={example.code}>
                            {example.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

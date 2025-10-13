import React, { useState, useEffect } from 'react';

const DEFAULT_COLORS = ['#EF4444', '#F97316', '#FBBF24', '#84CC16', '#22C55E', '#06B6D4', '#6366F1', '#EC4899'];

const getCustomColors = (): string[] => {
    try {
        const colors = localStorage.getItem('mermaid-custom-colors');
        return colors ? JSON.parse(colors) : [];
    } catch (e) {
        console.error("Failed to parse custom colors from localStorage", e);
        return [];
    }
};

const setCustomColors = (colors: string[]) => {
    try {
        localStorage.setItem('mermaid-custom-colors', JSON.stringify(colors));
    } catch (e) {
        console.error("Failed to save custom colors to localStorage", e);
    }
};

interface ColorPickerProps {
    color: string | undefined;
    onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const [customColors, updateCustomColors] = useState<string[]>(getCustomColors());
    const [customColorInput, setCustomColorInput] = useState(color || '#ffffff');

    useEffect(() => {
        setCustomColorInput(color || '#ffffff');
    }, [color]);

    const handleAddCustomColor = () => {
        if (/^#[0-9A-F]{6}$/i.test(customColorInput)) {
            const newCustomColors = [customColorInput, ...customColors.filter(c => c.toLowerCase() !== customColorInput.toLowerCase())].slice(0, 2);
            updateCustomColors(newCustomColors);
            setCustomColors(newCustomColors);
            onChange(customColorInput);
        }
    };
    
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2">
                {DEFAULT_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => onChange(c)} className="w-6 h-6 rounded-full border-2 transition-transform transform hover:scale-110" style={{ backgroundColor: c, borderColor: color && color.toLowerCase() === c.toLowerCase() ? '#fff' : 'transparent' }} aria-label={`Select color ${c}`} />
                ))}
                {customColors.map(c => (
                     <button key={c} type="button" onClick={() => onChange(c)} className="w-6 h-6 rounded-full border-2 transition-transform transform hover:scale-110" style={{ backgroundColor: c, borderColor: color && color.toLowerCase() === c.toLowerCase() ? '#fff' : 'transparent' }} aria-label={`Select custom color ${c}`} />
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="color" 
                    value={customColorInput} 
                    onChange={e => {
                        setCustomColorInput(e.target.value);
                        onChange(e.target.value);
                    }} 
                    onBlur={handleAddCustomColor}
                    className="w-8 h-8 p-0 border-none rounded bg-gray-700 cursor-pointer" 
                />
                <input
                    type="text"
                    value={customColorInput.toUpperCase()}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onBlur={handleAddCustomColor}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomColor()}
                    className="bg-gray-900 text-white text-sm rounded-md p-1 w-24 font-mono"
                    placeholder="#RRGGBB"
                    aria-label="Custom hex color"
                />
            </div>
        </div>
    );
};


import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { ColorPicker } from './ColorPicker';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

interface IconPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddIcon: (svgDataUri: string) => void;
}

interface IconifyInfo {
    prefix: string;
    name: string;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onAddIcon }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [collectionPrefix, setCollectionPrefix] = useState('');
    const [searchResults, setSearchResults] = useState<IconifyInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<IconifyInfo | null>(null);
    const [iconColor, setIconColor] = useState('#ffffff');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedCollectionPrefix = useDebounce(collectionPrefix, 500);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setSearchTerm('');
            setCollectionPrefix('');
            setSearchResults([]);
            setSelectedIcon(null);
            setIsLoading(false);
            return;
        }

        const searchIcons = async () => {
            if (!debouncedSearchTerm) {
                setSearchResults([]);
                return;
            }
            setIsLoading(true);
            try {
                let url = `https://api.iconify.design/search?query=${encodeURIComponent(debouncedSearchTerm)}&limit=100`;
                if (debouncedCollectionPrefix) {
                    url += `&prefixes=${encodeURIComponent(debouncedCollectionPrefix)}`;
                }
                const response = await fetch(url);
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                const icons = (data.icons || []).map((icon: string) => {
                    const [prefix, name] = icon.split(':');
                    return { prefix, name };
                });
                setSearchResults(icons);
            } catch (error) {
                console.error("Failed to fetch icons:", error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        searchIcons();
    }, [debouncedSearchTerm, debouncedCollectionPrefix, isOpen]);
    
    const handleAddClick = async () => {
        if (!selectedIcon) return;

        try {
            const response = await fetch(`https://api.iconify.design/${selectedIcon.prefix}/${selectedIcon.name}.svg?color=${encodeURIComponent(iconColor)}`);
            if (!response.ok) throw new Error('Could not fetch SVG');
            const svgText = await response.text();
            
            const dataUri = `data:image/svg+xml;base64,${btoa(svgText)}`;
            onAddIcon(dataUri);

        } catch (error) {
            console.error("Failed to process icon for adding:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Icon name="image" className="w-6 h-6" />
                        Add Icon
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-grow p-4 overflow-hidden flex flex-col gap-4">
                     <div className="flex gap-4">
                        <div className="relative flex-grow">
                            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for icons (e.g., 'user')..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="relative w-1/3">
                            <Icon name="library" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter by set (e.g., mdi)"
                                value={collectionPrefix}
                                onChange={(e) => setCollectionPrefix(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex-grow bg-gray-900/50 rounded-lg p-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="text-center text-gray-400">Loading...</div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                {searchResults.map(icon => (
                                    <button
                                        key={`${icon.prefix}:${icon.name}`}
                                        onClick={() => setSelectedIcon(icon)}
                                        className={`p-2 rounded-md aspect-square flex items-center justify-center transition-colors ${selectedIcon?.prefix === icon.prefix && selectedIcon?.name === icon.name ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        title={`${icon.prefix}:${icon.name}`}
                                    >
                                        <img src={`https://api.iconify.design/${icon.prefix}/${icon.name}.svg?color=white`} className="w-full h-full" alt={`${icon.name} icon`} />
                                    </button>
                                ))}
                            </div>
                        ) : debouncedSearchTerm ? (
                            <div className="text-center text-gray-400">No results found for "{debouncedSearchTerm}".</div>
                        ) : (
                             <div className="text-center text-gray-500 pt-16">
                                <Icon name="search" className="w-12 h-12 mx-auto mb-4 text-gray-600"/>
                                <p>Start typing to search for icons from thousands of packs.</p>
                             </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-between items-center gap-4 rounded-b-lg border-t border-gray-600">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center p-2">
                             {selectedIcon && (
                                <img src={`https://api.iconify.design/${selectedIcon.prefix}/${selectedIcon.name}.svg?color=${encodeURIComponent(iconColor)}`} className="w-full h-full" alt="Selected icon preview" />
                             )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Icon Color</label>
                            <ColorPicker color={iconColor} onChange={setIconColor} />
                        </div>
                     </div>
                     <Button onClick={handleAddClick} disabled={!selectedIcon}>
                        <Icon name="add" className="w-4 h-4 mr-1"/>
                        Add Icon to Canvas
                     </Button>
                </div>
            </div>
        </div>
    );
};
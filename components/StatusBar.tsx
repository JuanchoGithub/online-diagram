import React, { useState } from 'react';
import type { LogEntry } from '../types';
import { Icon } from './Icon';

interface StatusBarProps {
    log: LogEntry[];
}

const LOG_TYPE_CLASSES = {
    success: 'text-green-400',
    info: 'text-blue-400',
    error: 'text-red-400',
};

const LOG_ICON_NAMES = {
    success: 'check-circle',
    info: 'info',
    error: 'alert-circle',
};

export const StatusBar: React.FC<StatusBarProps> = ({ log }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const latestEntry = log.length > 0 ? log[log.length - 1] : null;

    return (
        <footer className={`fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40 transition-all duration-300 ease-in-out ${isExpanded ? 'h-48' : 'h-10'}`}>
            <div className="h-full flex flex-col">
                {/* Collapsed View / Header */}
                <div 
                    className="flex-shrink-0 flex items-center justify-between px-4 h-10 cursor-pointer hover:bg-gray-700"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2 text-sm overflow-hidden whitespace-nowrap">
                        {latestEntry ? (
                            <>
                                <Icon name={LOG_ICON_NAMES[latestEntry.type]} className={`w-4 h-4 flex-shrink-0 ${LOG_TYPE_CLASSES[latestEntry.type]}`} />
                                <span className="text-gray-300 truncate">{latestEntry.message}</span>
                            </>
                        ) : (
                            <span className="text-gray-500">No new messages.</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                        <span className="bg-gray-600 text-gray-200 rounded-full px-2 py-0.5">{log.length}</span>
                        <Icon name={isExpanded ? 'chevron-down' : 'chevron-up'} className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
                
                {/* Expanded View */}
                {isExpanded && (
                    <div className="flex-grow overflow-y-auto p-4 bg-gray-900">
                        <ul className="space-y-2">
                            {log.length === 0 ? (
                                <li className="text-gray-500 text-sm">Log is empty.</li>
                            ) : (
                                [...log].reverse().map((entry, index) => (
                                    <li key={`${entry.timestamp}-${index}`} className="flex items-start gap-3 text-sm">
                                        <Icon name={LOG_ICON_NAMES[entry.type]} className={`w-4 h-4 mt-0.5 flex-shrink-0 ${LOG_TYPE_CLASSES[entry.type]}`} />
                                        <span className="text-gray-400 font-mono text-xs">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                        <span className="text-gray-200 flex-grow">{entry.message}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </footer>
    );
};
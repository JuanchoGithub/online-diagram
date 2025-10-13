import React from 'react';

interface IconProps {
    name: string;
    className?: string;
}

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const ICONS: { [key: string]: React.ReactElement } = {
    logo: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    editor: <path d="M10.89 2.11a2 2 0 012.22 0l8.66 5a2 2 0 011.11 1.73v10a2 2 0 01-1.11 1.73l-8.66 5a2 2 0 01-2.22 0l-8.66-5a2 2 0 01-1.11-1.73v-10a2 2 0 011.11-1.73l8.66-5zM12 22.09V12M22 8.91L12 12" />,
    visual: <path d="M17.5 19H9a7 7 0 110-14h8.5a3.5 3.5 0 110 7h-8.5a3.5 3.5 0 100 7z" />,
    tutorial: <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />,
    download: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />,
    copy: <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />,
    save: <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />,
    add: <path d="M12 5v14m-7-7h14" />,
    delete: <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6" />,
    'chevron-left': <polyline points="15 18 9 12 15 6" />,
    'chevron-right': <polyline points="9 18 15 12 9 6" />,
    library: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v2H6.5A2.5 2.5 0 0 1 4 4.5v15zM20 2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    undo: <><path d="M3 10h10a8 8 0 0 1 0 16h-1" /><path d="M7 6l-4 4 4 4" /></>,
};

export const Icon: React.FC<IconProps> = ({ name, className = 'h-6 w-6' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {ICONS[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
);
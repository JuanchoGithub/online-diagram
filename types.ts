
export interface Diagram {
    id: string;
    title: string;
    code: string;
    createdAt: string;
}

export type ThemeName = 'default' | 'dark' | 'forest' | 'neutral';

export interface Theme {
    name: string;
    config: object;
}

export type View = 'editor' | 'tutorial' | 'visual-builder';

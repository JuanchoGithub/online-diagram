
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

export interface LogEntry {
    message: string;
    type: 'success' | 'info' | 'error';
    timestamp: string;
}

export interface DiagramObject {
    id: string;
    label: string;
    sourceId?: string;
    targetId?: string;
}

export interface ParsedDiagramObjects {
    nodes: DiagramObject[];
    edges: DiagramObject[];
    subgraphs: DiagramObject[];
    others: DiagramObject[];
}

export interface SyntaxExplanation {
    title: string;
    description: string;
    example?: string;
}

// New interface for detailed keywords within a larger syntax construct
export interface SyntaxDetail {
    keywords: string[];
    explanation: SyntaxExplanation;
    values?: SyntaxDetail[]; // Can be nested for property -> values
}

export interface SyntaxDefinition {
    matcher: RegExp;
    explanation: SyntaxExplanation; // General explanation for the whole line/construct
    category?: string;
    details?: SyntaxDetail[]; // Granular explanations for parts of the construct
}

export interface DiagramSyntax {
    keywords: string[];
    definitions: SyntaxDefinition[];
    docsUrl?: string;
    tutorialTopic: string;
}

export interface TutorialStep {
    title: string;
    description: string;
    code: string;
}

export interface TutorialCategory {
    title: string;
    id: string;
    steps: TutorialStep[];
}

export interface TutorialContent {
    title: string;
    description: string;
    categories: TutorialCategory[];
}
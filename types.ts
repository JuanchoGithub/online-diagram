
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

export interface SyntaxExplanation {
    title: string;
    description: string;
    example?: string;
}

export interface SyntaxDefinition {
    matcher: RegExp;
    explanation: SyntaxExplanation;
    category?: string;
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

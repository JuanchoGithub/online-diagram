import type { SyntaxExplanation } from '../types';
import { SYNTAX_DEFINITIONS } from './mermaid-syntax';

class SyntaxService {
    getExplanationForPosition(code: string, position: number): { 
        explanation: SyntaxExplanation | null,
        related: SyntaxExplanation[] | null,
        category: string | null,
        diagramType: string | null,
        tutorialTopic: string | null
    } {
        const lines = code.split('\n');
        let charCount = 0;
        let currentLine = '';

        for (const line of lines) {
            if (position <= charCount + line.length) {
                currentLine = line;
                break;
            }
            charCount += line.length + 1;
        }
        
        const trimmedLine = currentLine.trim();
        const diagramTypeInfo = this.getDiagramType(code);

        if (!diagramTypeInfo) {
            return { explanation: null, related: null, category: null, diagramType: null, tutorialTopic: null };
        }

        const syntax = SYNTAX_DEFINITIONS.find(def => def.keywords.includes(diagramTypeInfo.keyword));
        if (!syntax) {
            return { explanation: null, related: null, category: null, diagramType: diagramTypeInfo.type, tutorialTopic: null };
        }
        
        for (const definition of syntax.definitions) {
            if (definition.matcher.test(trimmedLine)) {
                const category = definition.category || null;
                const related = category 
                    ? syntax.definitions
                        .filter(def => def.category === category && def.matcher.source !== definition.matcher.source)
                        .map(def => def.explanation)
                    : null;

                return { 
                    explanation: definition.explanation,
                    related,
                    category,
                    diagramType: diagramTypeInfo.type, 
                    tutorialTopic: syntax.tutorialTopic
                };
            }
        }

        return { explanation: null, related: null, category: null, diagramType: diagramTypeInfo.type, tutorialTopic: syntax.tutorialTopic };
    }

    private getDiagramType(code: string): { keyword: string; type: string } | null {
        const firstLine = code.trim().split('\n')[0].trim();
        if (!firstLine) return null;

        for (const def of SYNTAX_DEFINITIONS) {
            for (const keyword of def.keywords) {
                 // Use a regex to ensure it's a whole word match at the start of the line
                const matcher = new RegExp(`^${keyword}\\b`);
                if (matcher.test(firstLine)) {
                    const type = keyword.replace(/^-v2$/, '').replace(/Diagram$/, ' Diagram').replace(/([A-Z])/g, ' $1').trim();
                    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
                    return { keyword, type: formattedType };
                }
            }
        }
        return null;
    }
}

export const syntaxService = new SyntaxService();

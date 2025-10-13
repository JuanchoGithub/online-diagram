import type { SyntaxExplanation, SyntaxDetail } from '../types';
import { SYNTAX_DEFINITIONS } from './mermaid-syntax';

const getWordAtPosition = (text: string, position: number): string | null => {
    // This regex finds words composed of letters, numbers, and hyphens bounded by non-word characters.
    const wordRegex = /[\w-]+/g;
    let match;
    while ((match = wordRegex.exec(text)) !== null) {
        const word = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + word.length;
        // Check if the cursor position is within the boundaries of the current word.
        if (position >= startIndex && position < endIndex) {
            return word;
        }
    }
    return null;
};


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
            // Find the line where the cursor is located
            if (position <= charCount + line.length) {
                currentLine = line;
                break;
            }
            charCount += line.length + 1; // +1 for the newline character
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

        const lineDef = syntax.definitions.find(def => def.matcher.test(trimmedLine));

        if (!lineDef) {
            return { explanation: null, related: null, category: null, diagramType: diagramTypeInfo.type, tutorialTopic: syntax.tutorialTopic };
        }
        
        const leadingWhitespace = currentLine.search(/\S|$/);
        const posInTrimmedLine = (position - charCount) - leadingWhitespace;
        const wordUnderCursor = getWordAtPosition(trimmedLine, posInTrimmedLine);

        let explanation = lineDef.explanation;
        let related: SyntaxExplanation[] | null = null;
        const category = lineDef.category || null;
        let specificExplanationFound = false;

        if (wordUnderCursor && lineDef.details) {
            // Search for a matching property or value keyword
            for (const detail of lineDef.details) {
                // Is it a property keyword? (e.g., 'shape')
                if (detail.keywords.includes(wordUnderCursor)) {
                    explanation = detail.explanation;
                    specificExplanationFound = true;
                    break;
                }
                // Is it a value keyword? (e.g., 'cloud')
                if (detail.values) {
                    for (const valueDetail of detail.values) {
                        if (valueDetail.keywords.includes(wordUnderCursor)) {
                            explanation = valueDetail.explanation;
                            specificExplanationFound = true;
                            break;
                        }
                    }
                }
                if (specificExplanationFound) break;
            }
        }
        
        if (specificExplanationFound && lineDef.details) {
            // If we are inspecting a specific keyword, "related" should show other available properties.
            related = lineDef.details
                .filter(d => d.explanation.title !== explanation.title)
                .map(d => d.explanation);
        } else if (category) {
            // Fallback to category-based related items
            related = syntax.definitions
                .filter(def => def.category === category && def.matcher.source !== lineDef.matcher.source)
                .map(def => def.explanation);
        }

        return {
            explanation,
            related,
            category,
            diagramType: diagramTypeInfo.type,
            tutorialTopic: syntax.tutorialTopic
        };
    }

    private getDiagramType(code: string): { keyword: string; type: string } | null {
        const firstLine = code.trim().split('\n')[0].trim();
        if (!firstLine) return null;

        for (const def of SYNTAX_DEFINITIONS) {
            for (const keyword of def.keywords) {
                const matcher = new RegExp(`^${keyword}\\b`);
                if (matcher.test(firstLine)) {
                    const type = keyword.replace(/-v2$/, '').replace(/Diagram$/, ' Diagram').replace(/([A-Z])/g, ' $1').trim();
                    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
                    return { keyword, type: formattedType };
                }
            }
        }
        return null;
    }
}

export const syntaxService = new SyntaxService();
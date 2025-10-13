import type { DiagramSyntax } from '../../types';
import { flowchartSyntax } from './flowchart';
import { sequenceSyntax } from './sequence';
import { commonSyntax } from './common';

// Order matters: more specific keywords should come first.
export const SYNTAX_DEFINITIONS: DiagramSyntax[] = [
    {
        ...flowchartSyntax,
        definitions: [...flowchartSyntax.definitions, ...commonSyntax]
    },
    {
        ...sequenceSyntax,
        definitions: [...sequenceSyntax.definitions, ...commonSyntax]
    }
];

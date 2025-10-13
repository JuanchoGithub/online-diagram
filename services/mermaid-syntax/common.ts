import type { SyntaxDefinition } from '../../types';

export const commonSyntax: SyntaxDefinition[] = [
    {
        matcher: /%%.*/,
        explanation: {
            title: 'Comment',
            description: 'Lines starting with %% are treated as comments and are ignored by the parser. They are useful for adding notes to your diagram code.',
            example: '%% This is a comment'
        },
        category: 'General',
    },
     {
        matcher: /classDef/,
        explanation: {
            title: 'Class Definition',
            description: 'Defines a class of styles that can be applied to nodes. This allows you to group styling information under a single name.',
            example: 'classDef special fill:#f9f,stroke:#333,stroke-width:2px;'
        },
        category: 'Styling',
    },
    {
        matcher: /\bclass\b/,
        explanation: {
            title: 'Apply Class',
            description: 'Applies a previously defined class (using classDef) to one or more nodes.',
            example: 'class B special;'
        },
        category: 'Styling',
    },
    {
        matcher: /linkStyle/,
        explanation: {
            title: 'Link Style',
            description: 'Applies styling to a specific link/edge in the diagram, identified by its zero-based index.',
            example: 'linkStyle 0 stroke:#ff3,stroke-width:4px;'
        },
        category: 'Styling',
    },
];

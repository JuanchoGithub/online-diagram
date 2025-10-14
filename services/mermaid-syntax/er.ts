import type { DiagramSyntax } from '../../types';

export const erSyntax: DiagramSyntax = {
    keywords: ['erDiagram'],
    tutorialTopic: 'er',
    definitions: [
        {
            matcher: /^erDiagram/,
            explanation: {
                title: 'ER Diagram Declaration',
                description: 'Initializes an Entity Relationship diagram.',
                example: 'erDiagram'
            },
            category: 'Declaration',
        },
        {
            matcher: /direction (TB|BT|RL|LR)/,
            explanation: {
                title: 'Direction',
                description: 'Sets the orientation of the diagram. Can be TB (Top to Bottom), BT (Bottom to Top), RL (Right to Left), or LR (Left to Right).',
                example: 'direction LR'
            },
            category: 'Declaration',
        },
        {
            matcher: /.+?\s+[|o}][|o}]\s*(?:--|\.\.)\s*[|o}][|o}]\s*.+?\s*:.+/,
            explanation: {
                title: 'Relationship',
                description: 'Defines a relationship between two entities. It specifies cardinality (e.g., ||, }o), identification ( -- for identifying, .. for non-identifying), and a descriptive label.',
                example: 'CUSTOMER ||--o{ ORDER : places'
            },
            category: 'Relationships'
        },
        {
            matcher: /^\s*(\w+|"[^"]+")\s*\{/,
            explanation: {
                title: 'Entity Attributes',
                description: 'Defines attributes for an entity within curly braces {}. Each attribute has a type and a name. You can also specify keys (PK, FK, UK) and comments.',
                example: 'CUSTOMER {\n    string name PK "Customer\'s full name"\n    string custNumber UK\n}'
            },
            category: 'Attributes',
            details: [
                {
                    keywords: ['PK'],
                    explanation: { title: 'Primary Key (PK)', description: 'Marks an attribute as a Primary Key for the entity.' },
                },
                {
                    keywords: ['FK'],
                    explanation: { title: 'Foreign Key (FK)', description: 'Marks an attribute as a Foreign Key, referencing another entity.' },
                },
                {
                    keywords: ['UK'],
                    explanation: { title: 'Unique Key (UK)', description: 'Marks an attribute as having a Unique Key constraint.' },
                }
            ]
        },
    ]
};

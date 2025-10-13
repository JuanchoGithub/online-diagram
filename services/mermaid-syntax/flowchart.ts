import type { DiagramSyntax } from '../../types';
import { getAdvancedShapesDetail } from './shapes';

export const flowchartSyntax: DiagramSyntax = {
    keywords: ['graph', 'flowchart'],
    tutorialTopic: 'flowchart',
    definitions: [
        {
            matcher: /^(graph|flowchart)(\s+TD|\s+TB|\s+BT|\s+RL|\s+LR)?/,
            explanation: {
                title: 'Flowchart Declaration',
                description: "Initializes a flowchart using `graph` or its alias `flowchart`. An optional orientation keyword can be provided to control the flow direction. Orientations include: TD or TB (Top to Bottom), BT (Bottom to Top), LR (Left to Right), and RL (Right to Left). If no orientation is specified, it defaults to Top to Bottom.",
                example: 'graph TD\nflowchart LR'
            },
            category: 'Declaration',
        },
        // LINKS
        {
            matcher: /-->|@-->/,
            explanation: {
                title: 'Arrow Link',
                description: 'Creates a solid connection between two nodes with an arrowhead at the end. You can assign an ID to an edge by prepending it with an @ symbol for later styling or animation.',
                example: 'A --> B\nC e1@--> D'
            },
            category: 'Links',
        },
        {
            matcher: /---/,
            explanation: {
                title: 'Line Link',
                description: 'Creates a solid connection between two nodes without an arrowhead.',
                example: 'A --- B'
            },
            category: 'Links',
        },
        {
            matcher: /-\.->/,
            explanation: {
                title: 'Dotted Link',
                description: 'Creates a dotted connection between two nodes with an arrowhead.',
                example: 'A -.-> B'
            },
            category: 'Links',
        },
         {
            matcher: /~~~/,
            explanation: {
                title: 'Invisible Link',
                description: 'Creates an invisible link. This is useful for forcing the layout engine to position nodes in a specific way without drawing a visible line.',
                example: 'A ~~~ B'
            },
            category: 'Links',
        },
        {
            matcher: /--o|o--o/,
            explanation: {
                title: 'Circle Link',
                description: 'Creates a connection between two nodes ending with a circle. Can be used on one or both ends.',
                example: 'A --o B\nC o--o D'
            },
            category: 'Links',
        },
        {
            matcher: /--x|x--x/,
            explanation: {
                title: 'Cross Link',
                description: 'Creates a connection between two nodes ending with a cross. Can be used on one or both ends.',
                example: 'A --x B\nC x--x D'
            },
            category: 'Links',
        },
         {
            matcher: /<-->/,
            explanation: {
                title: 'Bidirectional Link',
                description: 'Creates a link with arrowheads on both ends, indicating a two-way relationship.',
                example: 'A <--> B'
            },
            category: 'Links',
        },
        {
            matcher: /==>|@==>/,
            explanation: {
                title: 'Thick Link',
                description: 'Creates a thick, solid connection between two nodes with an arrowhead. Can also have an ID assigned.',
                example: 'A ==> B\nC e2@==>D'
            },
            category: 'Links',
        },
        {
            matcher: /\|[^|]+\||--\s+.*\s+--/,
            explanation: {
                title: 'Link Text',
                description: 'Adds a text label to a link. The text can be placed between two pipe characters or between the dashes of the link definition.',
                example: 'A -->|"Link Label"| B\nA -- "Some Text" --> B'
            },
            category: 'Links',
        },
        // NODES (Ordered from most-specific to least-specific)
        {
            matcher: /@\{.*\}/,
            explanation: {
                title: 'Advanced Properties',
                description: 'Uses a modern, structured syntax to define a node with a specific shape from an expanded library, set properties for edges like animations, or embed icons and images.',
                example: 'A@{ shape: cloud, label: "Cloud Action" }\ne1@{ animation: fast }'
            },
            category: 'Nodes',
            details: [
                {
                    keywords: ['shape'],
                    explanation: {
                        title: 'Property: shape',
                        description: `Specifies the shape of the node from an expanded library of semantically-named shapes. Click on a shape name in your code to see the full list.`,
                        example: 'shape: cloud'
                    },
                    values: [ getAdvancedShapesDetail() ]
                },
                {
                    keywords: ['label'],
                    explanation: {
                        title: 'Property: label',
                        description: 'Sets the text content displayed inside the node. Markdown can be used if enclosed in backticks.',
                        example: 'label: "`My **bold** text`"'
                    }
                },
                {
                    keywords: ['icon'],
                    explanation: {
                        title: 'Property: icon',
                        description: 'Embeds a registered FontAwesome icon into the node.',
                        example: 'icon: "fa-user"'
                    }
                },
                {
                    keywords: ['img'],
                    explanation: {
                        title: 'Property: img',
                        description: 'Embeds an image from a URL into the node. You can also control width (w), height (h), and label position (pos).',
                        example: 'img: "https://.../image.png"'
                    }
                }
            ]
        },
        {
            matcher: /\(\(\(.*\)\)\)/,
            explanation: {
                title: 'Node (Double Circle)',
                description: 'Defines a node with a double circle border.',
                example: 'F(((Double Circle)))'
            },
            category: 'Nodes',
        },
        {
            matcher: /\(\(.*\)\)/,
            explanation: {
                title: 'Node (Circle)',
                description: 'Defines a node with a circular shape.',
                example: 'D(("Circle shape"))'
            },
            category: 'Nodes',
        },
        {
            matcher: /\(\[.*\]\)/,
            explanation: {
                title: 'Node (Stadium)',
                description: 'Defines a node with a stadium shape (a rectangle with fully rounded ends).',
                example: 'C(["Stadium shape"])'
            },
            category: 'Nodes',
        },
        {
            matcher: /\[\[.*\]\]/,
            explanation: {
                title: 'Node (Subroutine)',
                description: 'Defines a node with a subroutine shape (a rectangle with double vertical lines).',
                example: 'G[[Subroutine]]'
            },
            category: 'Nodes',
        },
        {
            matcher: /\[\(.*\)\]/,
            explanation: {
                title: 'Node (Cylinder)',
                description: 'Defines a node with a cylindrical shape, often used to represent databases.',
                example: 'H[(Database)]'
            },
            category: 'Nodes',
        },
        {
            matcher: /\[\/.*\\\]|\[\\.*\/\]/,
            explanation: {
                title: 'Node (Trapezoid)',
                description: 'Defines a node with a trapezoid shape, either standard or inverted.',
                example: 'L[/Trapezoid/]\nM[\\Trapezoid Alt/]'
            },
            category: 'Nodes',
        },
        {
            matcher: /\[\/.*\/\]|\[\\.*\\\]/,
            explanation: {
                title: 'Node (Parallelogram)',
                description: 'Defines a node with a parallelogram shape, leaning either right or left.',
                example: 'J[/Parallelogram/]\nK[\\Parallelogram Alt\\]'
            },
            category: 'Nodes',
        },
        {
            matcher: /\{\{.*\}\}/,
            explanation: {
                title: 'Node (Hexagon)',
                description: 'Defines a node with a hexagonal shape.',
                example: 'I{{Hexagon}}'
            },
            category: 'Nodes',
        },
        {
            matcher: /\(.*\)/,
            explanation: {
                title: 'Node (Round Edges)',
                description: 'Defines a node with rounded edges. Text is placed inside the parentheses.',
                example: 'B("Round edge")'
            },
            category: 'Nodes',
        },
        {
            matcher: /\[.*\]/,
            explanation: {
                title: 'Node (Rectangle)',
                description: 'Defines a node with a rectangular shape. Text is placed inside the brackets.',
                example: 'A["Hard edge"]'
            },
            category: 'Nodes',
        },
        {
            matcher: /\{.*\}/,
            explanation: {
                title: 'Node (Rhombus/Decision)',
                description: 'Defines a node with a rhombus shape, typically used for decisions.',
                example: 'E{"Decision shape"}'
            },
            category: 'Nodes',
        },
        {
            matcher: />.*]/,
            explanation: {
                title: 'Node (Asymmetric)',
                description: 'Defines a node with an asymmetric shape, often used to represent data stores.',
                example: 'F>"Asymmetric shape"]'
            },
            category: 'Nodes',
        },
        {
            matcher: /\bfa:\S+/,
            explanation: {
                title: 'Font Awesome Icon',
                description: 'Embeds a Font Awesome icon within a node\'s text. The appropriate Font Awesome CSS file must be loaded on the page.',
                example: 'A["fa:fa-check-circle Success"]'
            },
            category: 'Nodes',
        },
        // STRUCTURE
        {
            matcher: /subgraph/,
            explanation: {
                title: 'Subgraph',
                description: 'Groups a set of nodes together under a common title. A subgraph is defined by `subgraph "Title"` or `subgraph id[Title]` and concludes with an `end` keyword.',
                example: 'subgraph "My Subgraph"\n    A --> B\nend'
            },
            category: 'Structure',
        },
        // INTERACTIVITY
         {
            matcher: /click\s/,
            explanation: {
                title: 'Click Event',
                description: 'Binds a click event to a node, which can open a URL or trigger a JavaScript callback function. Note: This requires the app\'s security level to be set to "loose".',
                example: 'click NodeId "https://example.com" "Tooltip"\nclick NodeId call myCallback()'
            },
            category: 'Interactivity',
        },
        // STYLING
         {
            matcher: /:::/,
            explanation: {
                title: 'Quick Class Attachment',
                description: 'A shorthand operator `:::` to attach a pre-defined class to a node directly in its definition line.',
                example: 'A:::myClass --> B'
            },
            category: 'Styling',
        },
        {
            matcher: /\bstyle\s/,
            explanation: {
                title: 'Direct Node Style',
                description: 'Applies specific CSS-like styles directly to a single node using its ID.',
                example: 'style A fill:#f00,stroke:#fff'
            },
            category: 'Styling',
        },
    ]
};
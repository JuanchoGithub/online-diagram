import type { TutorialContent } from '../types';

export const flowchartTutorial: TutorialContent = {
  title: 'Flowchart Tutorial',
  description: 'Flowcharts visualize a process or workflow, showing steps as boxes of various kinds, and their order by connecting them with arrows.',
  categories: [
    {
      title: 'Declaration & Orientation',
      id: 'Declaration',
      steps: [
        {
          title: 'Declaring a Flowchart',
          description: 'Every flowchart must begin with `graph` or `flowchart`. An optional orientation keyword controls the flow direction: `TD` or `TB` (Top to Bottom), `BT` (Bottom to Top), `LR` (Left to Right), and `RL` (Right to Left).',
          code: `flowchart LR
    A[Start] --> B[Finish]`,
        },
      ],
    },
    {
      title: 'Node Shapes (Standard)',
      id: 'Nodes',
      steps: [
        {
          title: 'Basic Shapes',
          description: 'Mermaid offers a variety of syntaxes for common node shapes.',
          code: `flowchart TD
    A[Rectangle]
    B(Rounded Edges)
    C([Stadium])
    D((Circle))
    E{Rhombus/Decision}`,
        },
        {
          title: 'Specialized & Angled Shapes',
          description: 'More complex shapes are available for specific use cases like databases, subroutines, or angled diagrams.',
          code: `flowchart TD
    F>Asymmetric]
    G[[Subroutine]]
    H[(Database)]
    I{{Hexagon}}
    J(((Double Circle)))
    K[/Parallelogram/]
    L[\\Trapezoid Alt/]`,
        },
        {
          title: 'Markdown in Nodes',
          description: 'Use backticks ` `` ` inside a quoted node label to include Markdown for text formatting like **bold** and _italics_, and to create automatic line breaks.',
          code: `flowchart TD
    A["\`This **is** _Markdown_
and this is a new line\`"]`
        }
      ],
    },
    {
      title: 'Node Shapes (Advanced & Special)',
      id: 'Advanced Shapes',
      steps: [
        {
          title: 'Expanded Shape Library',
          description: 'Use the <strong>`id@{ shape: ... }`</strong> syntax to access dozens of new, semantically-named shapes. This provides far more options for creating precise diagrams. Available shapes include: `card`, `cloud`, `cylinder`, `document`, `event`, `manual-input`, `prepare`, `process`, `terminal`, and many more.',
          code: `flowchart RL
    A@{ shape: manual-file, label: "File Handling"}
    B@{ shape: docs, label: "Multiple Documents"}
    C@{ shape: procs, label: "Process Automation"}
    D@{ shape: paper-tape, label: "Paper Records"}`
        },
        {
          title: 'Embedding Images',
          description: 'You can embed images directly into your flowchart nodes using the `img` property. You can also control the width (`w`), height (`h`), and label position (`pos`).',
          code: `flowchart TD
  A@{ img: "https://mermaid.js.org/favicon.svg", label: "My Image", pos: "t", h: 60, constraint: "on" }`
        },
        {
          title: 'Embedding Icons',
          description: 'Use the `icon` property to embed registered FontAwesome icons, or use the `fa:fa-icon-name` syntax directly in the node text.',
          code: `flowchart TD
    A@{ icon: "fa:user", label: "User Icon" }
    B["fa:fa-check-circle Success"]`
        },
      ]
    },
    {
      title: 'Links & Edges',
      id: 'Links',
      steps: [
        {
          title: 'Basic & Styled Links',
          description: 'Connect nodes with different styles: `-->` (arrow), `---` (line), `-.->` (dotted), and `==>` (thick). Add text using `|text|` or `-- text --`.',
          code: `graph TD
    A -- "Link Text" --> B
    B --- C
    C -.-> D
    D ==> E`,
        },
        {
          title: 'Special & Multi-Directional Links',
          description: 'Create links ending in circles (`--o`), crosses (`--x`), or make them bi-directional (`<-->`, `o--o`, `x--x`).',
          code: `graph LR
    A --o B
    C --x D
    E <--> F
    G o--o H`,
        },
        {
          title: 'Controlling Link Length & Visibility',
          description: 'Add extra dashes (`----`) to suggest a longer link. Use `~~~` for an invisible link to influence layout without drawing a line.',
          code: `graph TD
    A --> B
    B ----> C
    D ~~~ E`,
        },
      ],
    },
    {
      title: 'Structure & Comments',
      id: 'Structure',
      steps: [
        {
          title: 'Subgraphs',
          description: 'Use `subgraph` and `end` to group nodes. You can link to/from the entire subgraph by using its assigned ID. You can also specify a `direction` for the subgraph.',
          code: `flowchart LR
    subgraph "Group 1"
        direction TB
        A --> B
    end
    
    C --> Group 1`,
        },
        {
          title: 'Comments',
          description: 'Use `%%` to add comments to your code. The parser will ignore them.',
          code: `graph TD
    %% This is a comment
    A[Start] --> B[End]`,
        },
      ],
    },
    {
      title: 'Styling',
      id: 'Styling',
      steps: [
        {
          title: 'Direct Node Styling',
          description: 'Use the <strong>`style`</strong> keyword to apply CSS styling directly to a node by its ID.',
          code: `graph TD
    A --> B
    style A fill:#f00,stroke:#fff,stroke-width:2px`
        },
        {
          title: 'Defining & Applying Classes',
          description: '<strong>`classDef`</strong> creates a reusable style class. Apply it with <strong>`class`</strong> or the <strong>`:::`</strong> shorthand for cleaner code.',
          code: `graph TD
    A:::myStyle --> B
    C --> D
    classDef myStyle fill:#f9f,stroke:#333
    class D myStyle`,
        },
        {
          title: 'Styling Links',
          description: '<strong>`linkStyle`</strong> applies CSS styling to a link based on its render order (starting from 0).',
          code: `graph TD
    A --> B
    C --> D
    linkStyle 0 stroke:red,stroke-width:2px
    linkStyle 1 stroke:blue,stroke-width:4px`,
        },
        {
          title: 'Styling Line Curves',
          description: 'Assign an ID to an edge, then use the `@{ curve: ... }` syntax to change its shape. Supported curves include `linear`, `natural`, `step`, and more.',
          code: `flowchart LR
    A e1@--> B
    e1@{ curve: linear }
    A e2@--> C
    e2@{ curve: natural }`
        }
      ],
    },
     {
        title: 'Interactivity & Animation',
        id: 'Interactivity',
        steps: [
          {
            title: 'Clickable Nodes',
            description: 'Make nodes interactive by attaching <strong>`click`</strong> events that can link to URLs or call JavaScript functions. Note that this requires a "loose" security level in the app configuration.',
            code: `graph LR
    A[Go to Mermaid Docs] --> B
    click A "https://mermaid.js.org/syntax/flowchart.html" "Visit Docs"`
          },
          {
            title: 'Animating Links',
            description: 'Assign an ID to an edge using the <strong>`@`</strong> syntax (e.g., `e1@==>`). Then, you can define animation properties for that edge ID to make your diagram dynamic.',
            code: `flowchart LR
  A e1@--> B
  e1@{ animation: fast }
  
  C e2@==> D
  classDef animate stroke-dasharray: 5,5, animation: dash 2s linear infinite;
  class e2 animate`
          }
        ],
      },
  ],
};

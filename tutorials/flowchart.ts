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
      title: 'Node Shapes',
      id: 'Nodes',
      steps: [
        {
          title: 'Comprehensive Node Shapes',
          description: `Mermaid provides a rich set of node shapes to create expressive flowcharts. The table below details the syntax for each available shape.<br/><br/>
            <div class="overflow-x-auto bg-gray-900/50 rounded-lg border border-gray-700">
              <table class="w-full text-sm text-left text-gray-300">
                <thead class="text-xs text-gray-200 uppercase bg-gray-700">
                  <tr><th class="px-4 py-2">Shape Name</th><th class="px-4 py-2">Syntax</th><th class="px-4 py-2">Example Code</th></tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Rectangle</td>
                    <td class="px-4 py-2 font-mono"><code>id[Text]</code></td>
                    <td class="px-4 py-2 font-mono"><code>A[Rectangle]</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Rounded Rectangle</td>
                    <td class="px-4 py-2 font-mono"><code>id(Text)</code></td>
                    <td class="px-4 py-2 font-mono"><code>B(Rounded)</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Stadium</td>
                    <td class="px-4 py-2 font-mono"><code>id([Text])</code></td>
                    <td class="px-4 py-2 font-mono"><code>C([Stadium])</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Subroutine</td>
                    <td class="px-4 py-2 font-mono"><code>id[[Text]]</code></td>
                    <td class="px-4 py-2 font-mono"><code>D[[Subroutine]]</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Cylinder</td>
                    <td class="px-4 py-2 font-mono"><code>id[(Text)]</code></td>
                    <td class="px-4 py-2 font-mono"><code>E[(Cylinder)]</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Circle</td>
                    <td class="px-4 py-2 font-mono"><code>id((Text))</code></td>
                    <td class="px-4 py-2 font-mono"><code>F((Circle))</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Double Circle</td>
                    <td class="px-4 py-2 font-mono"><code>id(((Text)))</code></td>
                    <td class="px-4 py-2 font-mono"><code>G(((Double Circle)))</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Rhombus / Decision</td>
                    <td class="px-4 py-2 font-mono"><code>id{Text}</code></td>
                    <td class="px-4 py-2 font-mono"><code>H{Rhombus}</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Hexagon</td>
                    <td class="px-4 py-2 font-mono"><code>id{{Text}}</code></td>
                    <td class="px-4 py-2 font-mono"><code>I{{Hexagon}}</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Asymmetric</td>
                    <td class="px-4 py-2 font-mono"><code>id>Text]</code></td>
                    <td class="px-4 py-2 font-mono"><code>J>Asymmetric]</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Parallelogram</td>
                    <td class="px-4 py-2 font-mono"><code>id[/Text/]</code></td>
                    <td class="px-4 py-2 font-mono"><code>K[/Parallelogram/]</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Parallelogram (Alt)</td>
                    <td class="px-4 py-2 font-mono"><code>id[\\Text\\]</code></td>
                    <td class="px-4 py-2 font-mono"><code>L[\\\\Parallelogram Alt\\\\]</code></td>
                  </tr>
                  <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                    <td class="px-4 py-2">Trapezoid</td>
                    <td class="px-4 py-2 font-mono"><code>id[/Text\\]</code></td>
                    <td class="px-4 py-2 font-mono"><code>M[/Trapezoid\\\\]</code></td>
                  </tr>
                  <tr class="hover:bg-gray-700/50">
                    <td class="px-4 py-2">Trapezoid (Alt)</td>
                    <td class="px-4 py-2 font-mono"><code>id[\\Text/]</code></td>
                    <td class="px-4 py-2 font-mono"><code>N[\\\\Trapezoid Alt/]</code></td>
                  </tr>
                </tbody>
              </table>
            </div>`,
          code: `flowchart TD
    A[Rectangle] --> B(Rounded)
    B --> C([Stadium])
    C --> D[[Subroutine]]
    D --> E[(Cylinder)]
    E --> F((Circle))
    F --> G(((Double Circle)))
    G --> H{Rhombus}
    H --> I{{Hexagon}}
    I --> J>Asymmetric]
    J --> K[/Parallelogram/]
    K --> L[\\Parallelogram Alt\\]
    L --> M[/Trapezoid\\]
    M --> N[\\Trapezoid Alt/]`,
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
      id: 'advanced-shapes',
      steps: [
        {
          title: 'Expanded Shape Library',
          description: 'Use the <strong>`id@{ shape: ... }`</strong> syntax to access dozens of new, semantically-named shapes. This provides far more options for creating precise diagrams. Available shapes include: `card`, `cloud`, `cylinder`, `document`, `event`, `manual-input`, `prepare`, `process`, `terminal`, and many more.',
          code: `flowchart TD
    A@{ shape: cloud, label: "Cloud Action" }
    B@{ shape: document, label: "Read Docs" }
    C@{ shape: terminal, label: "End Process" }

    A --> B --> C`
        },
        {
          title: 'Embedding Images',
          description: 'You can embed images directly into your flowchart nodes using the `img` property. You can also control the width (`w`), height (`h`), and label position (`pos`).',
          code: `flowchart TD
  A["\`🖼️\nMy Image\`"]`
        },
        {
          title: 'Embedding Icons',
          description: 'Use the `icon` property to embed registered FontAwesome icons, or use the `fa:fa-icon-name` syntax directly in the node text.',
          code: `flowchart TD
    A["fa:fa-user User Icon"]
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
    subgraph groupA["Group 1"]
        direction TB
        A --> B
    end
    
    C --> groupA`,
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

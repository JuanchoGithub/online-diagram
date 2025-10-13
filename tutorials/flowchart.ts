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
          title: 'Expanded Shape Library (Advanced)',
          description: `Use the <strong>\`id@{ shape: ... }\`</strong> syntax to access dozens of new, semantically-named shapes. This provides far more options for creating precise diagrams. Below is a comprehensive list of all available shapes, their short names (for use in code), and aliases.<br/><br/><div class="overflow-x-auto bg-gray-900/50 rounded-lg border border-gray-700">
  <table class="w-full text-sm text-left text-gray-300">
    <thead class="text-xs text-gray-200 uppercase bg-gray-700">
      <tr>
        <th class="px-4 py-2">Semantic Name</th>
        <th class="px-4 py-2">Shape Name</th>
        <th class="px-4 py-2">Short Name</th>
        <th class="px-4 py-2">Description</th>
        <th class="px-4 py-2">Aliases</th>
      </tr>
    </thead>
    <tbody>
      
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Bang</td>
        <td class="px-4 py-2">Bang</td>
        <td class="px-4 py-2 font-mono"><code>bang</code></td>
        <td class="px-4 py-2">Bang</td>
        <td class="px-4 py-2 font-mono"><code>bang</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Card</td>
        <td class="px-4 py-2">Notched Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>notch-rect</code></td>
        <td class="px-4 py-2">Represents a card</td>
        <td class="px-4 py-2 font-mono"><code>card, notched-rectangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Cloud</td>
        <td class="px-4 py-2">Cloud</td>
        <td class="px-4 py-2 font-mono"><code>cloud</code></td>
        <td class="px-4 py-2">cloud</td>
        <td class="px-4 py-2 font-mono"><code>cloud</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Collate</td>
        <td class="px-4 py-2">Hourglass</td>
        <td class="px-4 py-2 font-mono"><code>hourglass</code></td>
        <td class="px-4 py-2">Represents a collate operation</td>
        <td class="px-4 py-2 font-mono"><code>collate, hourglass</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Com Link</td>
        <td class="px-4 py-2">Lightning Bolt</td>
        <td class="px-4 py-2 font-mono"><code>bolt</code></td>
        <td class="px-4 py-2">Communication link</td>
        <td class="px-4 py-2 font-mono"><code>com-link, lightning-bolt</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Comment</td>
        <td class="px-4 py-2">Curly Brace</td>
        <td class="px-4 py-2 font-mono"><code>brace</code></td>
        <td class="px-4 py-2">Adds a comment</td>
        <td class="px-4 py-2 font-mono"><code>brace-l, comment</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Comment Right</td>
        <td class="px-4 py-2">Curly Brace</td>
        <td class="px-4 py-2 font-mono"><code>brace-r</code></td>
        <td class="px-4 py-2">Adds a comment</td>
        <td class="px-4 py-2 font-mono"><code></code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Comment with braces on both sides</td>
        <td class="px-4 py-2">Curly Braces</td>
        <td class="px-4 py-2 font-mono"><code>braces</code></td>
        <td class="px-4 py-2">Adds a comment</td>
        <td class="px-4 py-2 font-mono"><code></code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Data Input/Output</td>
        <td class="px-4 py-2">Lean Right</td>
        <td class="px-4 py-2 font-mono"><code>lean-r</code></td>
        <td class="px-4 py-2">Represents input or output</td>
        <td class="px-4 py-2 font-mono"><code>in-out, lean-right</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Data Input/Output</td>
        <td class="px-4 py-2">Lean Left</td>
        <td class="px-4 py-2 font-mono"><code>lean-l</code></td>
        <td class="px-4 py-2">Represents output or input</td>
        <td class="px-4 py-2 font-mono"><code>lean-left, out-in</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Database</td>
        <td class="px-4 py-2">Cylinder</td>
        <td class="px-4 py-2 font-mono"><code>cyl</code></td>
        <td class="px-4 py-2">Database storage</td>
        <td class="px-4 py-2 font-mono"><code>cylinder, database, db</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Decision</td>
        <td class="px-4 py-2">Diamond</td>
        <td class="px-4 py-2 font-mono"><code>diam</code></td>
        <td class="px-4 py-2">Decision-making step</td>
        <td class="px-4 py-2 font-mono"><code>decision, diamond, question</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Delay</td>
        <td class="px-4 py-2">Half-Rounded Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>delay</code></td>
        <td class="px-4 py-2">Represents a delay</td>
        <td class="px-4 py-2 font-mono"><code>half-rounded-rectangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Direct Access Storage</td>
        <td class="px-4 py-2">Horizontal Cylinder</td>
        <td class="px-4 py-2 font-mono"><code>h-cyl</code></td>
        <td class="px-4 py-2">Direct access storage</td>
        <td class="px-4 py-2 font-mono"><code>das, horizontal-cylinder</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Disk Storage</td>
        <td class="px-4 py-2">Lined Cylinder</td>
        <td class="px-4 py-2 font-mono"><code>lin-cyl</code></td>
        <td class="px-4 py-2">Disk storage</td>
        <td class="px-4 py-2 font-mono"><code>disk, lined-cylinder</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Display</td>
        <td class="px-4 py-2">Curved Trapezoid</td>
        <td class="px-4 py-2 font-mono"><code>curv-trap</code></td>
        <td class="px-4 py-2">Represents a display</td>
        <td class="px-4 py-2 font-mono"><code>curved-trapezoid, display</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Divided Process</td>
        <td class="px-4 py-2">Divided Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>div-rect</code></td>
        <td class="px-4 py-2">Divided process shape</td>
        <td class="px-4 py-2 font-mono"><code>div-proc, divided-process, divided-rectangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Document</td>
        <td class="px-4 py-2">Document</td>
        <td class="px-4 py-2 font-mono"><code>doc</code></td>
        <td class="px-4 py-2">Represents a document</td>
        <td class="px-4 py-2 font-mono"><code>doc, document</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Event</td>
        <td class="px-4 py-2">Rounded Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>rounded</code></td>
        <td class="px-4 py-2">Represents an event</td>
        <td class="px-4 py-2 font-mono"><code>event</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Extract</td>
        <td class="px-4 py-2">Triangle</td>
        <td class="px-4 py-2 font-mono"><code>tri</code></td>
        <td class="px-4 py-2">Extraction process</td>
        <td class="px-4 py-2 font-mono"><code>extract, triangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Fork/Join</td>
        <td class="px-4 py-2">Filled Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>fork</code></td>
        <td class="px-4 py-2">Fork or join in process flow</td>
        <td class="px-4 py-2 font-mono"><code>join</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Internal Storage</td>
        <td class="px-4 py-2">Window Pane</td>
        <td class="px-4 py-2 font-mono"><code>win-pane</code></td>
        <td class="px-4 py-2">Internal storage</td>
        <td class="px-4 py-2 font-mono"><code>internal-storage, window-pane</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Junction</td>
        <td class="px-4 py-2">Filled Circle</td>
        <td class="px-4 py-2 font-mono"><code>f-circ</code></td>
        <td class="px-4 py-2">Junction point</td>
        <td class="px-4 py-2 font-mono"><code>filled-circle, junction</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Lined Document</td>
        <td class="px-4 py-2">Lined Document</td>
        <td class="px-4 py-2 font-mono"><code>lin-doc</code></td>
        <td class="px-4 py-2">Lined document</td>
        <td class="px-4 py-2 font-mono"><code>lined-document</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Lined/Shaded Process</td>
        <td class="px-4 py-2">Lined Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>lin-rect</code></td>
        <td class="px-4 py-2">Lined process shape</td>
        <td class="px-4 py-2 font-mono"><code>lin-proc, lined-process, lined-rectangle, shaded-process</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Loop Limit</td>
        <td class="px-4 py-2">Trapezoidal Pentagon</td>
        <td class="px-4 py-2 font-mono"><code>notch-pent</code></td>
        <td class="px-4 py-2">Loop limit step</td>
        <td class="px-4 py-2 font-mono"><code>loop-limit, notched-pentagon</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Manual File</td>
        <td class="px-4 py-2">Flipped Triangle</td>
        <td class="px-4 py-2 font-mono"><code>flip-tri</code></td>
        <td class="px-4 py-2">Manual file operation</td>
        <td class="px-4 py-2 font-mono"><code>flipped-triangle, manual-file</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Manual Input</td>
        <td class="px-4 py-2">Sloped Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>sl-rect</code></td>
        <td class="px-4 py-2">Manual input step</td>
        <td class="px-4 py-2 font-mono"><code>manual-input, sloped-rectangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Manual Operation</td>
        <td class="px-4 py-2">Trapezoid Base Top</td>
        <td class="px-4 py-2 font-mono"><code>trap-t</code></td>
        <td class="px-4 py-2">Represents a manual task</td>
        <td class="px-4 py-2 font-mono"><code>inv-trapezoid, manual, trapezoid-top</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Multi-Document</td>
        <td class="px-4 py-2">Stacked Document</td>
        <td class="px-4 py-2 font-mono"><code>docs</code></td>
        <td class="px-4 py-2">Multiple documents</td>
        <td class="px-4 py-2 font-mono"><code>documents, st-doc, stacked-document</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Multi-Process</td>
        <td class="px-4 py-2">Stacked Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>st-rect</code></td>
        <td class="px-4 py-2">Multiple processes</td>
        <td class="px-4 py-2 font-mono"><code>processes, procs, stacked-rectangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Odd</td>
        <td class="px-4 py-2">Odd</td>
        <td class="px-4 py-2 font-mono"><code>odd</code></td>
        <td class="px-4 py-2">Odd shape</td>
        <td class="px-4 py-2 font-mono"><code></code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Paper Tape</td>
        <td class="px-4 py-2">Flag</td>
        <td class="px-4 py-2 font-mono"><code>flag</code></td>
        <td class="px-4 py-2">Paper tape</td>
        <td class="px-4 py-2 font-mono"><code>paper-tape</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Prepare Conditional</td>
        <td class="px-4 py-2">Hexagon</td>
        <td class="px-4 py-2 font-mono"><code>hex</code></td>
        <td class="px-4 py-2">Preparation or condition step</td>
        <td class="px-4 py-2 font-mono"><code>hexagon, prepare</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Priority Action</td>
        <td class="px-4 py-2">Trapezoid Base Bottom</td>
        <td class="px-4 py-2 font-mono"><code>trap-b</code></td>
        <td class="px-4 py-2">Priority action</td>
        <td class="px-4 py-2 font-mono"><code>priority, trapezoid, trapezoid-bottom</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Process</td>
        <td class="px-4 py-2">Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>rect</code></td>
        <td class="px-4 py-2">Standard process shape</td>
        <td class="px-4 py-2 font-mono"><code>proc, process, rectangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Start</td>
        <td class="px-4 py-2">Circle</td>
        <td class="px-4 py-2 font-mono"><code>circle</code></td>
        <td class="px-4 py-2">Starting point</td>
        <td class="px-4 py-2 font-mono"><code>circ</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Start</td>
        <td class="px-4 py-2">Small Circle</td>
        <td class="px-4 py-2 font-mono"><code>sm-circ</code></td>
        <td class="px-4 py-2">Small starting point</td>
        <td class="px-4 py-2 font-mono"><code>small-circle, start</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Stop</td>
        <td class="px-4 py-2">Double Circle</td>
        <td class="px-4 py-2 font-mono"><code>dbl-circ</code></td>
        <td class="px-4 py-2">Represents a stop point</td>
        <td class="px-4 py-2 font-mono"><code>double-circle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Stop</td>
        <td class="px-4 py-2">Framed Circle</td>
        <td class="px-4 py-2 font-mono"><code>fr-circ</code></td>
        <td class="px-4 py-2">Stop point</td>
        <td class="px-4 py-2 font-mono"><code>framed-circle, stop</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Stored Data</td>
        <td class="px-4 py-2">Bow Tie Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>bow-rect</code></td>
        <td class="px-4 py-2">Stored data</td>
        <td class="px-4 py-2 font-mono"><code>bow-tie-rectangle, stored-data</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Subprocess</td>
        <td class="px-4 py-2">Framed Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>fr-rect</code></td>
        <td class="px-4 py-2">Subprocess</td>
        <td class="px-4 py-2 font-mono"><code>framed-rectangle, subproc, subprocess, subroutine</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Summary</td>
        <td class="px-4 py-2">Crossed Circle</td>
        <td class="px-4 py-2 font-mono"><code>cross-circ</code></td>
        <td class="px-4 py-2">Summary</td>
        <td class="px-4 py-2 font-mono"><code>crossed-circle, summary</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Tagged Document</td>
        <td class="px-4 py-2">Tagged Document</td>
        <td class="px-4 py-2 font-mono"><code>tag-doc</code></td>
        <td class="px-4 py-2">Tagged document</td>
        <td class="px-4 py-2 font-mono"><code>tag-doc, tagged-document</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Tagged Process</td>
        <td class="px-4 py-2">Tagged Rectangle</td>
        <td class="px-4 py-2 font-mono"><code>tag-rect</code></td>
        <td class="px-4 py-2">Tagged process</td>
        <td class="px-4 py-2 font-mono"><code>tag-proc, tagged-process, tagged-rectangle</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Terminal Point</td>
        <td class="px-4 py-2">Stadium</td>
        <td class="px-4 py-2 font-mono"><code>stadium</code></td>
        <td class="px-4 py-2">Terminal point</td>
        <td class="px-4 py-2 font-mono"><code>pill, terminal</code></td>
      </tr>
      <tr class="border-b border-gray-700 hover:bg-gray-700/50">
        <td class="px-4 py-2">Text Block</td>
        <td class="px-4 py-2">Text Block</td>
        <td class="px-4 py-2 font-mono"><code>text</code></td>
        <td class="px-4 py-2">Text block</td>
        <td class="px-4 py-2 font-mono"><code></code></td>
      </tr>
    </tbody>
  </table>
</div>`,
          code: `flowchart TD
    subgraph "Flow Control & Events"
        A@{ shape: start, label: "Start/Stop" } --> B@{ shape: decision, label: "Decision" }
        B --> C@{ shape: junction, label: "Junction" } --> D@{ shape: fork, label: "Fork/Join" }
        D --> E@{ shape: event, label: "Event" } --> F@{ shape: delay, label: "Delay" }
        F --> G@{ shape: bang, label: "Bang" } --> H@{ shape: 'loop-limit', label: "Loop Limit" }
        H --> I@{ shape: terminal, label: "Terminal Point" }
    end

    subgraph "Processes & Operations"
        direction LR
        P1@{ shape: process, label: "Process" } --> P2@{ shape: subprocess, label: "Subprocess" }
        P2 --> P3@{ shape: 'div-proc', label: "Divided" } --> P4@{ shape: procs, label: "Multi-Process" }
        P4 --> P5@{ shape: manual, label: "Manual Op" } --> P6@{ shape: prepare, label: "Prepare" }
        P6 --> P7@{ shape: extract, label: "Extract" } --> P8@{ shape: collate, label: "Collate" }
        P8 --> P9@{ shape: summary, label: "Summary" } --> P10@{ shape: 'tag-proc', label: "Tagged Process" }
    end
    
    subgraph "Data, I/O & Documents"
        subgraph "Documents"
            D1@{ shape: card, label: "Card" } --> D2@{ shape: document, label: "Document" }
            D2 --> D3@{ shape: docs, label: "Multi-Doc" } --> D4@{ shape: 'tag-doc', label: "Tagged Doc" }
            D4 --> D5@{ shape: 'manual-file', label: "Manual File" } --> D6@{ shape: 'paper-tape', label: "Paper Tape" }
        end
        subgraph "Storage & I/O"
            D8@{ shape: db, label: "Database" } --> D9@{ shape: 'internal-storage', label: "Internal" }
            D9 --> D10@{ shape: 'stored-data', label: "Stored Data" } --> D11@{ shape: das, label: "DAS" }
            D11 --> D12@{ shape: disk, label: "Disk" } --> D13@{ shape: 'lean-r', label: "Data I/O" }
            D13 --> D14@{ shape: 'manual-input', label: "Manual Input" } --> D7@{ shape: display, label: "Display" }
        end
    end
    
    subgraph "Misc & Annotations"
        M1@{ shape: cloud, label: "Cloud" } --> M2@{ shape: 'com-link', label: "Com Link" }
        M3@{ shape: text, label: "Text Block" } --> M4@{ shape: brace, label: "Comment" }
    end

    %% Connect the main groups
    I --> P1
    P10 --> D1 & D8
    D6 --> M1
    D7 --> M3`,
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
import type { TutorialContent } from '../types';

export const sequenceTutorial: TutorialContent = {
  title: 'Sequence Diagram Tutorial',
  description: 'Sequence diagrams illustrate how different parts of a system interact with each other over time, showing messages passed between participants in a chronological order.',
  categories: [
    {
      title: 'Participants & Actors',
      id: 'Participants',
      steps: [
        {
          title: 'Defining Participants',
          description: 'Participants are the primary entities in a sequence diagram. Use `participant` for a standard box and `actor` for a user symbol. You can also define an `as` alias for brevity.',
          code: `sequenceDiagram
    actor User
    participant "API Gateway" as GW
    participant "Backend Service" as BE

    User->>GW: Request data
    GW->>BE: Forward request`,
        },
        {
          title: 'Special Participant Shapes',
          description: 'For more descriptive diagrams, you can assign special shapes to participants using the `@{ type: "..." }` syntax. Supported types include `boundary`, `control`, `entity`, `database`, `collections`, and `queue`.',
          code: `sequenceDiagram
    participant User @{ type: "boundary" }
    participant Logic @{ type: "control" }
    participant DB @{ type: "database" }
    
    User->>Logic: Save data
    Logic->>DB: INSERT query`,
        },
        {
          title: 'Creating and Destroying Participants',
          description: 'Participants can be dynamically created and destroyed during the flow using the `create` and `destroy` keywords. This is useful for modeling temporary objects or connections.',
          code: `sequenceDiagram
    participant A
    A->>B: Hello
    create participant C
    A->>C: You are new!
    destroy C
    C->>A: Goodbye!`,
        },
        {
          title: 'Grouping Participants with Boxes',
          description: 'Use `box` and `end` to group related participants. You can optionally add a title and a color (using `rgb` or a color name) to the box.',
          code: `sequenceDiagram
    box Aqua "Client Side"
        actor User
        participant Browser
    end
    box "Server Side"
        participant Server
    end
    User->>Browser: Click button
    Browser->>Server: API Call`,
        },
      ],
    },
    {
      title: 'Messages',
      id: 'Messages',
      steps: [
        {
          title: 'Message Arrow Types',
          description: `Different arrows represent different types of communication. Below is a comprehensive list of available message types.<br/><br/>
          <div class="overflow-x-auto bg-gray-900/50 rounded-lg border border-gray-700">
            <table class="w-full text-sm text-left text-gray-300">
              <thead class="text-xs text-gray-200 uppercase bg-gray-700">
                <tr><th class="px-4 py-2">Syntax</th><th class="px-4 py-2">Description</th></tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code>->></code></td><td class="px-4 py-2">Solid line with solid arrowhead (synchronous call)</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code>-->></code></td><td class="px-4 py-2">Dashed line with solid arrowhead (reply or async)</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code>-></code></td><td class="px-4 py-2">Solid line with open arrowhead (async call)</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code>--)</code></td><td class="px-4 py-2">Dashed line with open arrowhead (async call)</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code>-x</code></td><td class="px-4 py-2">Solid line with a cross (lost/error message)</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code>--x</code></td><td class="px-4 py-2">Dashed line with a cross (lost/error message)</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code><<->></code></td><td class="px-4 py-2">Solid line with bidirectional arrowheads</td></tr>
                <tr class="hover:bg-gray-700/50"><td class="px-4 py-2 font-mono"><code><<-->></code></td><td class="px-4 py-2">Dashed line with bidirectional arrowheads</td></tr>
              </tbody>
            </table>
          </div>`,
          code: `sequenceDiagram
    A->>B: Synchronous Call
    B-->>A: Synchronous Reply
    A->B: Asynchronous Call
    A-x_B: Lost Message`,
        },
      ],
    },
    {
      title: 'Activations',
      id: 'Activations',
      steps: [
        {
          title: 'Activating and Deactivating',
          description: 'Use `+` and `-` at the end of a message to show when a participant\'s lifeline becomes active (processing) or inactive. This is visualized as a rectangle on the lifeline.',
          code: `sequenceDiagram
    User->>+API: GET /data
    API-->>-User: JSON data`,
        },
        {
          title: 'Nested Activations',
          description: 'Activations can be nested to show a participant calling another service (or itself) while it is already active.',
          code: `sequenceDiagram
    A->>+B: Initial request
    B->>+C: Internal call
    C-->>-B: Internal response
    B-->>-A: Final response`,
        },
        {
            title: 'Explicit Activation Keywords',
            description: 'As an alternative to the `+/-` shortcuts, you can use the `activate` and `deactivate` keywords on their own lines for more control.',
            code: `sequenceDiagram
    A->>B: Do something
    activate B
    B-->>A: Done
    deactivate B`
        }
      ],
    },
    {
      title: 'Notes & Annotations',
      id: 'Annotations',
      steps: [
        {
          title: 'Adding Notes',
          description: 'Add explanatory notes to your diagram using `Note`. Notes can be positioned `right of`, `left of`, or `over` one or more participants.',
          code: `sequenceDiagram
    Alice->>Bob: A message
    Note right of Bob: Bob is processing this.
    Note over Alice,Bob: An important interaction`,
        },
        {
          title: 'Line Breaks',
          description: 'You can add line breaks to messages and notes using the `<br/>` HTML tag to improve readability.',
          code: `sequenceDiagram
    A->>B: This is a<br/>multi-line message.
    Note over A,B: This note also<br/>spans two lines.`
        }
      ],
    },
    {
      title: 'Fragments (Loops, Alts, etc.)',
      id: 'Fragments',
      steps: [
        {
          title: 'Alt (Alternatives)',
          description: 'The `alt` fragment is used for if-else logic. Use the `else` keyword to separate the alternative flows.',
          code: `sequenceDiagram
    A->>B: Check status
    alt is successful
        B-->>A: OK
    else is error
        B-->>A: Failed
    end`,
        },
        {
          title: 'Opt (Optional)',
          description: 'The `opt` fragment is for a sequence that may or may not happen, like a simple if block.',
          code: `sequenceDiagram
    A->>B: Request data
    opt if cache is available
        B-->>A: Data from cache
    end`,
        },
        {
          title: 'Loop',
          description: 'The `loop` fragment is used for repeating actions, such as polling for a status.',
          code: `sequenceDiagram
    loop Every 5 seconds
        Client->>Server: Ping
        Server-->>Client: Pong
    end`,
        },
        {
          title: 'Par (Parallel)',
          description: 'The `par` fragment shows actions that are happening at the same time. Use the `and` keyword to separate the parallel flows.',
          code: `sequenceDiagram
    par
        A->>B: Call service 1
    and
        A->>C: Call service 2
    end`,
        },
        {
            title: 'Critical (Atomic Region)',
            description: 'The `critical` fragment indicates a set of operations that must be performed atomically. You can use `option` to model different outcomes, such as a failure.',
            code: `sequenceDiagram
    critical DB Transaction
        API->>DB: UPDATE records
    option Rollback on failure
        DB-->>API: Error
    end`
        },
        {
            title: 'Break (Exception)',
            description: 'The `break` fragment indicates an interruption or stop in the sequence flow, commonly used to model exceptions.',
            code: `sequenceDiagram
    A->>B: Process items
    break If processing fails
        B-->>A: Error message
    end`
        },
      ],
    },
    {
      title: 'Other Features',
      id: 'General',
      steps: [
        {
          title: 'Autonumbering Messages',
          description: 'Add the `autonumber` keyword at the beginning of your diagram to automatically number every message, making complex flows easier to follow.',
          code: `sequenceDiagram
    autonumber
    Client->>Server: Request
    Server-->>Client: Response`,
        },
        {
          title: 'Highlighting Flows',
          description: 'Use `rect rgb(r,g,b)` to draw a colored background rectangle around a part of the flow. This is great for highlighting important sections.',
          code: `sequenceDiagram
    A->>B: Step 1
    rect rgba(200, 255, 200, 0.5)
        B->>C: This part is important
        C-->>B: Important response
    end
    B-->>A: Step 2`,
        },
        {
            title: 'Clickable Links for Actors',
            description: 'You can add a clickable popup menu to participants using the `link` keyword. This is useful for linking to external dashboards, documentation, or code repositories.',
            code: `sequenceDiagram
    participant API
    link API: Health Dashboard @ https://...
    link API: Wiki Docs @ https://...
    
    User->>API: Make request`
        },
      ]
    }
  ],
};

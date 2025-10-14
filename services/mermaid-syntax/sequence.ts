import type { DiagramSyntax } from '../../types';

export const sequenceSyntax: DiagramSyntax = {
    keywords: ['sequenceDiagram'],
    tutorialTopic: 'sequence',
    definitions: [
        {
            matcher: /^sequenceDiagram/,
            explanation: {
                title: 'Sequence Diagram Declaration',
                description: 'Initializes a sequence diagram, which illustrates how processes or objects interact over time.',
                example: 'sequenceDiagram'
            },
            category: 'Declaration',
        },
        // PARTICIPANTS
        {
            matcher: /participant/,
            explanation: {
                title: 'Participant',
                description: 'Defines a participant in the sequence, shown as a box. Participants are rendered in their order of appearance. You can use `as` to create a shorter alias.',
                example: 'participant User\nparticipant "System A" as SA'
            },
            category: 'Participants',
        },
        {
            matcher: /actor/,
            explanation: {
                title: 'Actor',
                description: 'Defines a participant represented as a stick figure, typically used for users or external systems.',
                example: 'actor User'
            },
            category: 'Participants',
        },
        {
            matcher: /@\{.*\}/,
            explanation: {
                title: 'Special Participant Types',
                description: 'Uses JSON configuration to define a participant with a special shape like `boundary`, `control`, `entity`, `database`, `collections`, or `queue`.',
                example: 'participant DB @{ type: "database" }'
            },
            category: 'Participants',
        },
        {
            matcher: /\b(create|destroy)\b/,
            explanation: {
                title: 'Participant Creation/Destruction',
                description: 'Dynamically creates or destroys a participant during the sequence flow. `create` must come before a message to the new participant, and `destroy` must come before a message from the participant being destroyed.',
                example: 'create participant Carl\nAlice->>Carl: Hi!\ndestroy Carl\nCarl->>Alice: Goodbye!'
            },
            category: 'Participants'
        },
        // MESSAGES
        {
            matcher: /->>|-->>/,
            explanation: {
                title: 'Message (Solid/Dashed Arrow)',
                description: 'Represents a message from one participant to another. `->>` is a solid line (often for synchronous calls) and `-->>` is a dashed line (often for replies or asynchronous calls).',
                example: 'Alice->>Bob: Request\nBob-->>Alice: Response'
            },
            category: 'Messages',
        },
        {
            matcher: /->|-\)/,
            explanation: {
                title: 'Message (Open Arrow)',
                description: 'Represents an asynchronous message where the sender does not wait for a response. `->` is a solid line and `-)` is a dotted line.',
                example: 'Alice->Bob: FYI, this event occurred.'
            },
            category: 'Messages',
        },
        {
            matcher: /<<->>|<<-->>/,
            explanation: {
                title: 'Bi-Directional Message',
                description: 'Represents a message with arrowheads on both ends, indicating a two-way synchronous action. `<<->>` is solid and `<<-->>` is dashed.',
                example: 'Alice<<->>Bob: Syncing data'
            },
            category: 'Messages',
        },
        {
            matcher: /-x|--x/,
            explanation: {
                title: 'Lost/Error Message',
                description: 'Represents a message that does not reach its destination, indicated by a cross at the end. `-x` is a solid line and `--x` is a dashed line.',
                example: 'Alice-xBob: Lost message'
            },
            category: 'Messages',
        },
         {
            matcher: /-->|->/,
            explanation: {
                title: 'Message (No Arrowhead)',
                description: 'Represents a simple connection without a specific direction indicated by an arrowhead. `-->` is a dashed line and `->` is a solid line.',
                example: 'Alice-->Bob: A comment about connection'
            },
            category: 'Messages',
        },
        // ACTIVATIONS
        {
            matcher: /\+\s*$/,
            explanation: {
                title: 'Activation Start',
                description: 'Activates a participant, indicating that it is performing an action. This is shown as a box on the participant\'s lifeline. Use a `+` at the end of a message line.',
                example: 'User->>+API: Fetch data'
            },
            category: 'Activations',
        },
        {
            matcher: /-\s*$/,
            explanation: {
                title: 'Activation End',
                description: 'Deactivates a participant, ending the action block on its lifeline. Use a `-` at theend of a message line.',
                example: 'API-->>-User: Return data'
            },
            category: 'Activations',
        },
        {
            matcher: /\b(activate|deactivate)\b/,
            explanation: {
                title: 'Explicit Activation',
                description: 'Explicitly activates or deactivates a participant on a new line. This is an alternative to the +/- shortcuts.',
                example: 'activate Bob\nAlice->>Bob: Process this\ndeactivate Bob'
            },
            category: 'Activations',
        },
        // ANNOTATIONS
        {
            matcher: /Note/,
            explanation: {
                title: 'Note',
                description: 'Adds an explanatory note to the diagram. It can be placed `left of`, `right of`, or `over` one or more participants.',
                example: 'Note right of Alice: This is a note.\nNote over Alice,Bob: An interaction'
            },
            category: 'Annotations',
        },
        // FRAGMENTS
        {
            matcher: /\bloop\b/,
            explanation: {
                title: 'Loop Block',
                description: 'Creates a fragment to illustrate a sequence that repeats as long as a condition is met.',
                example: 'loop Every 10 seconds\n    A->>B: Check status\nend'
            },
            category: 'Fragments',
        },
        {
            matcher: /\balt\b/,
            explanation: {
                title: 'Alternative Block',
                description: 'Creates a fragment for alternative paths, similar to an if-else statement. Use `else` to define other paths.',
                example: 'alt Successful case\n    A->>B: Request\nelse Error case\n    A->>B: Handle error\nend'
            },
            category: 'Fragments',
        },
        {
            matcher: /\bopt\b/,
            explanation: {
                title: 'Optional Block',
                description: 'Creates a fragment for a sequence that is optional and only occurs if a condition is met.',
                example: 'opt If user is admin\n    A->>B: Perform admin action\nend'
            },
            category: 'Fragments',
        },
        {
            matcher: /\bpar\b/,
            explanation: {
                title: 'Parallel Block',
                description: 'Creates a fragment to show actions that happen in parallel. Use `and` to separate parallel actions.',
                example: 'par\n    A->>B: Action 1\nand\n    A->>C: Action 2\nend'
            },
            category: 'Fragments',
        },
        {
            matcher: /\bcritical\b/,
            explanation: {
                title: 'Critical Region Block',
                description: 'Indicates a critical action that must be performed atomically. It can have optional paths using the `option` keyword for handling different circumstances.',
                example: 'critical DB Transaction\n    API->>DB: UPDATE records\noption Rollback\n    DB->>API: Failure\nend'
            },
            category: 'Fragments'
        },
        {
            matcher: /\bbreak\b/,
            explanation: {
                title: 'Break Block',
                description: 'Indicates a break in the sequence flow, often used to model exceptions or interruptions.',
                example: 'loop Processing items\n    break If error occurs\n        API->>Client: Send error\n    end\nend'
            },
            category: 'Fragments'
        },
        // STRUCTURE & STYLING
        {
            matcher: /\bbox\b/,
            explanation: {
                title: 'Box Grouping',
                description: 'Groups multiple participants together under a colored box with a descriptive title.',
                example: 'box Purple "Backend Services"\n    participant API\n    participant DB\nend'
            },
            category: 'Structure',
        },
        {
            matcher: /\brect\b/,
            explanation: {
                title: 'Background Highlighting',
                description: 'Draws a colored rectangle in the background of a part of the sequence to highlight a specific flow or section.',
                example: 'rect rgb(200, 220, 255)\n    Alice->>Bob: Important flow\nend'
            },
            category: 'Structure',
        },
        // GENERAL
        {
            matcher: /autonumber/,
            explanation: {
                title: 'Autonumber',
                description: 'Automatically numbers each message in the diagram, making it easier to follow the sequence of events.',
                example: 'autonumber'
            },
            category: 'General',
        },
        {
            matcher: /link/,
            explanation: {
                title: 'Actor Link',
                description: 'Adds a clickable link to a participant, which appears as a popup menu. Useful for linking to external documentation or dashboards.',
                example: 'link Alice: Dashboard @ https://.../dashboard'
            },
            category: 'General',
        }
    ]
};

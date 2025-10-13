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
        {
            matcher: /participant/,
            explanation: {
                title: 'Participant',
                description: 'Defines a participant in the sequence, shown as a box. You can use `as` to create a shorter alias.',
                example: 'participant User\nparticipant System as S'
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
            matcher: /->>/,
            explanation: {
                title: 'Solid Line Message',
                description: 'Represents a synchronous message from one participant to another, shown with a solid line and a solid arrowhead.',
                example: 'Alice->>Bob: Hello!'
            },
            category: 'Messages',
        },
        {
            matcher: /-->>/,
            explanation: {
                title: 'Dashed Line Message',
                description: 'Represents an asynchronous message or reply, shown with a dashed line and a solid arrowhead.',
                example: 'Bob-->>Alice: How are you?'
            },
            category: 'Messages',
        },
        {
            matcher: /->/,
            explanation: {
                title: 'Solid Line Open Arrow',
                description: 'Represents a message with an open arrowhead, often used for asynchronous calls.',
                example: 'Alice->Bob: A one-way message.'
            },
            category: 'Messages',
        },
        {
            matcher: /--\)/,
            explanation: {
                title: 'Dashed Line Open Arrow',
                description: 'Represents a message with an open arrowhead on a dashed line.',
                example: 'Alice--)Bob: Another one-way message.'
            },
            category: 'Messages',
        },
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
                description: 'Deactivates a participant, ending the action block on its lifeline. Use a `-` at the end of a message line.',
                example: 'API-->>-User: Return data'
            },
            category: 'Activations',
        },
        {
            matcher: /Note/,
            explanation: {
                title: 'Note',
                description: 'Adds an explanatory note to the diagram. It can be placed `left of`, `right of`, or `over` one or more participants.',
                example: 'Note right of Alice: This is a note.'
            },
            category: 'Annotations',
        },
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
            matcher: /autonumber/,
            explanation: {
                title: 'Autonumber',
                description: 'Automatically numbers each message in the diagram, making it easier to follow the sequence of events.',
                example: 'autonumber'
            },
            category: 'General',
        }
    ]
};

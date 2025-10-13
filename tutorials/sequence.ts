import type { TutorialContent } from '../types';

export const sequenceTutorial: TutorialContent = {
  title: 'Sequence Diagram Tutorial',
  description: 'Sequence diagrams illustrate how different parts of a system interact with each other over time.',
  categories: [
    {
      title: 'Declaration',
      id: 'Declaration',
      steps: [
        {
          title: 'Initializing a Diagram',
          description: 'All sequence diagrams start with the `sequenceDiagram` keyword.',
          code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob!`,
        },
      ],
    },
    {
      title: 'Participants',
      id: 'Participants',
      steps: [
        {
          title: 'Participants',
          description: 'Participants are the vertical lifelines in the diagram. They are declared with the `participant` keyword.',
          code: `sequenceDiagram
    participant User`,
        },
        {
          title: 'Actors',
          description: 'Actors are participants represented by a stick figure, often used for users. Use the `actor` keyword.',
          code: `sequenceDiagram
    actor Admin`,
        },
        {
          title: 'Aliases',
          description: 'You can give participants shorter aliases using the `as` keyword, which is useful for complex diagrams.',
          code: `sequenceDiagram
    participant "Long System Name" as LSN`,
        },
      ],
    },
    {
      title: 'Messages',
      id: 'Messages',
      steps: [
        {
          title: 'Synchronous Message',
          description: '`->>` creates a solid line with a solid arrow, representing a standard message where the sender waits for a response.',
          code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Please process this.`,
        },
        {
          title: 'Asynchronous Message',
          description: '`->` creates a solid line with an open arrow, representing a message where the sender does not wait for a response.',
          code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->Bob: FYI, this event occurred.`,
        },
        {
          title: 'Reply Message',
          description: '`-->>` creates a dashed line with a solid arrow, typically used for replies.',
          code: `sequenceDiagram
    participant Alice
    participant Bob
    Bob-->>Alice: Here is the result.`,
        },
      ],
    },
    {
      title: 'Activations',
      id: 'Activations',
      steps: [
        {
          title: 'Activating and Deactivating',
          description: 'Use `+` and `-` to show when a participant is active (processing). Activation adds a bar to the lifeline.',
          code: `sequenceDiagram
    User->>+API: GET /data
    API-->>-User: JSON data`,
        },
        {
          title: 'Nested Activations',
          description: 'Activations can be nested to show a participant calling another service (or itself) while already active.',
          code: `sequenceDiagram
    A->>+B: Initial request
    B->>+C: Internal call
    C-->>-B: Internal response
    B-->>-A: Final response`,
        },
      ],
    },
    {
      title: 'Annotations',
      id: 'Annotations',
      steps: [
        {
          title: 'Notes',
          description: 'Add notes to explain a part of the sequence. Notes can be positioned `right of`, `left of`, or `over` participants.',
          code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: A message
    Note right of Bob: Bob is processing this.`,
        },
      ],
    },
    {
      title: 'Fragments',
      id: 'Fragments',
      steps: [
        {
          title: 'Alt (Alternatives)',
          description: '`alt` is used for if-else logic. Use `else` to separate the alternative flows.',
          code: `sequenceDiagram
    participant A
    participant B
    alt is successful
        A->>B: Great!
    else is error
        A->>B: Oops!
    end`,
        },
        {
          title: 'Opt (Optional)',
          description: '`opt` is for a sequence that may or may not happen.',
          code: `sequenceDiagram
    participant A
    participant B
    opt if user is logged in
        A->>B: Show personalized content
    end`,
        },
        {
          title: 'Loop',
          description: '`loop` is for repeating actions.',
          code: `sequenceDiagram
    participant A
    participant B
    loop for each item
        A->>B: Process item
    end`,
        },
        {
          title: 'Par (Parallel)',
          description: '`par` shows actions happening at the same time. Use `and` to separate parallel flows.',
          code: `sequenceDiagram
    participant A
    participant B
    participant C
    par
        A->>B: Call service 1
    and
        A->>C: Call service 2
    end`,
        },
      ],
    },
  ],
};

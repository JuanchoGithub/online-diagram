import type { TutorialContent } from '../types';

export const erTutorial: TutorialContent = {
  title: 'Entity Relationship (ER) Diagram Tutorial',
  description: 'An entity–relationship model describes interrelated things of interest in a specific domain of knowledge. A basic ER model is composed of entity types and specifies relationships that can exist between them.',
  categories: [
    {
      title: 'Entities and Relationships',
      id: 'Entities & Relationships',
      steps: [
        {
          title: 'Defining Entities and Relationships',
          description: 'Define entities and the relationships between them. The relationship syntax specifies cardinality (how many) and identification. The label describes the relationship from the first entity\'s perspective.',
          code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
        },
        {
          title: 'Unicode and Markdown',
          description: 'Entity names and labels support Unicode characters and Markdown formatting for expressive diagrams.',
          code: `erDiagram
    "CUSTOMER ❤" {
        string name "This **is** _Markdown_"
    }`
        }
      ],
    },
    {
      title: 'Relationship Syntax',
      id: 'Relationships',
      steps: [
        {
          title: 'Cardinality',
          description: `Cardinality describes how many elements of another entity can be related to the entity in question. It's marked by two characters: the outer for the maximum value and the inner for the minimum.<br/><br/>
          <div class="overflow-x-auto bg-gray-900/50 rounded-lg border border-gray-700">
            <table class="w-full text-sm text-left text-gray-300">
              <thead class="text-xs text-gray-200 uppercase bg-gray-700">
                <tr><th class="px-4 py-2">Cardinality</th><th class="px-4 py-2">Syntax</th><th class="px-4 py-2">Meaning</th></tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2">Zero or one</td><td class="px-4 py-2 font-mono"><code>o|</code> or <code>|o</code></td><td class="px-4 py-2">The entity is optional (0 or 1).</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2">Exactly one</td><td class="px-4 py-2 font-mono"><code>||</code></td><td class="px-4 py-2">The entity is mandatory (exactly 1).</td></tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50"><td class="px-4 py-2">Zero or more</td><td class="px-4 py-2 font-mono"><code>o{</code> or <code>}o</code></td><td class="px-4 py-2">Often called "many", can be zero.</td></tr>
                <tr class="hover:bg-gray-700/50"><td class="px-4 py-2">One or more</td><td class="px-4 py-2 font-mono"><code>|{</code> or <code>}|</code></td><td class="px-4 py-2">At least one is required.</td></tr>
              </tbody>
            </table>
          </div>`,
          code: `erDiagram
    A ||--|| B : "one to one"
    C |o--|{ D : "one to many"
    E }o--o{ F : "many to many (optional)"`,
        },
        {
          title: 'Identification',
          description: 'Relationships can be identifying (solid line, `--`) or non-identifying (dashed line, `..`). Identifying relationships mean the "child" entity cannot exist without the "parent".',
          code: `erDiagram
    CAR ||--o{ NAMED-DRIVER : "identifying (solid)"
    PERSON }o..o{ NAMED-DRIVER : "non-identifying (dashed)"`
        }
      ],
    },
    {
      title: 'Attributes',
      id: 'Attributes',
      steps: [
        {
          title: 'Defining Attributes',
          description: 'Define attributes for an entity by adding a block `{}` after its name. Each attribute has a `type` and a `name`.',
          code: `erDiagram
    CUSTOMER {
        string name
        string custNumber
        string sector
    }`,
        },
        {
            title: 'Attribute Keys and Comments',
            description: 'You can add keys (`PK`, `FK`, `UK`) and a `comment` to any attribute to provide more detail.',
            code: `erDiagram
    CAR {
        string registrationNumber PK "Primary Key"
        string make
        string model
    }
    NAMED-DRIVER {
        string carRegistrationNumber PK, FK
        string driverLicence PK, FK
    }`
        }
      ],
    },
    {
        title: 'Direction & Styling',
        id: 'Styling',
        steps: [
          {
            title: 'Diagram Direction',
            description: 'Control the layout orientation of your diagram with the `direction` keyword. Supported directions are `TB` (Top to Bottom), `BT` (Bottom to Top), `LR` (Left to Right), and `RL` (Right to Left).',
            code: `erDiagram
    direction LR
    A -- B`
          },
          {
            title: 'Styling with `style` and `classDef`',
            description: 'Apply custom styles directly to entities using `style` or define reusable classes with `classDef` and apply them with `class` or the `:::` shorthand.',
            code: `erDiagram
    CAR {
        string registrationNumber
    }
    PERSON:::personStyle

    PERSON ||--|| CAR : owns
    
    style CAR fill:#f9f,stroke-width:2px
    classDef personStyle fill:#bbf,stroke:#333`
          }
        ]
      }
  ],
};

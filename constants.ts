import type { Theme, ThemeName } from './types';

export const DEFAULT_DIAGRAM_CODE = `graph TD
    subgraph "Main Process"
        A[Start] --> B{Decision};
        B -- "Option 1" --> C[Result A];
        B -- "Option 2" --> D[Result B];
    end
    subgraph "Sub Process"
        C --> E[Final Step];
        D --> E;
    end
    E --> F((End));
    
    linkStyle 0 stroke:#ff3,stroke-width:4px;
    classDef special fill:#f9f,stroke:#333,stroke-width:2px;
    class B special;
`;

export const THEMES: Record<ThemeName, Theme> = {
    default: { name: 'Default', config: { theme: 'default' } },
    dark: { name: 'Dark', config: { theme: 'dark' } },
    forest: { name: 'Forest', config: { theme: 'forest' } },
    neutral: { name: 'Neutral', config: { theme: 'neutral' } },
};

export const CHART_EXAMPLES = [
    {
        name: 'C4 Diagram',
        code: `C4Context
  title System Context diagram for Internet Banking System

  Person(customer, "Personal Banking Customer", "A customer of the bank, with personal bank accounts.")
  System(internetBankingSystem, "Internet Banking System", "Allows customers to view information about their bank accounts and make payments.")

  System_Ext(emailSystem, "E-mail System", "The internal Microsoft Exchange e-mail system.")
  System_Ext(mainFrameBankingSystem, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

  Rel(customer, internetBankingSystem, "Uses")
  Rel(internetBankingSystem, emailSystem, "Sends e-mail", "SMTP")
  Rel(internetBankingSystem, mainFrameBankingSystem, "Uses", "XML/HTTPS")`
    },
    {
        name: 'Class Diagram',
        code: `classDiagram
    direction RL
    class Vehicle {
        +String brand
        +startEngine()
    }
    class Car {
        +int numberOfDoors
    }
    class Motorcycle {
        +bool hasSidecar
    }
    class Engine {
        +int horsepower
    }
    
    Vehicle <|-- Car
    Vehicle <|-- Motorcycle
    Vehicle "1" --o "1" Engine : has a`
    },
    {
        name: 'ER Diagram',
        code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`
    },
    {
        name: 'Flowchart',
        code: `graph TD
    subgraph "Main Process"
        A[Start] --> B{Decision};
        B -- "Option 1" --> C[Result A];
        B -- "Option 2" --> D[Result B];
    end
    subgraph "Sub Process"
        C --> E[Final Step];
        D --> E;
    end
    E --> F((End));
    
    linkStyle 0 stroke:#ff3,stroke-width:4px;
    classDef special fill:#f9f,stroke:#333,stroke-width:2px;
    class B special;`
    },
    {
        name: 'Gantt Chart',
        code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    
    section "Phase 1: Planning"
    Research           :done,    des1, 2024-01-01, 7d
    Specification      :active,  des2, after des1, 5d
    
    section "Phase 2: Development"
    Frontend           :         des3, after des2, 20d
    Backend            :         des4, after des2, 25d
    
    section "Phase 3: Launch"
    Deployment         :crit,    des5, after des3, 3d
    Marketing          :crit,           after des4, 5d`
    },
    {
        name: 'Git Graph',
        code: `gitGraph
    commit
    commit
    branch feature-a
    checkout feature-a
    commit
    commit
    checkout main
    merge feature-a
    commit
    commit`
    },
    {
        name: 'Mindmap',
        code: `mindmap
    root((Web Development))
        (Frontend)
            (Frameworks)
                (React)
                (Vue)
                (Svelte)
            (CSS)
                (Tailwind)
                (Sass)
        (Backend)
            (Node.js)
            (Python)
            (Go)`
    },
    {
        name: 'Pie Chart',
        code: `pie
    title Technology Usage
    "JavaScript" : 45
    "Python" : 25
    "Java" : 15
    "TypeScript" : 10
    "Other" : 5`
    },
    {
        name: 'Quadrant Chart',
        code: `quadrantChart
    title Market Analysis
    x-axis "Urgency" --> "High Urgency"
    y-axis "Importance" --> "High Importance"
    quadrant-1 "Do First"
    quadrant-2 "Schedule"
    quadrant-3 "Delegate"
    quadrant-4 "Eliminate"
    "New Website": [0.8, 0.9]
    "Fix Login Bug": [0.9, 0.7]
    "Update Docs": [0.4, 0.6]
    "Team Offsite": [0.2, 0.3]`
    },
    {
        name: 'Requirement Diagram',
        code: `requirementDiagram

requirement "Handle User Login" {
    id: 1
    text: The system shall allow users to log in.
    risk: Medium
    verifymethod: Test
}

element "Login Page" {
    type: GUI
}

"Login Page" -s-> "Handle User Login"`
    },
     {
        name: 'Sankey Diagram',
        code: `sankey-beta

Electricity,Gas,10
Electricity,Fossil,30
Electricity,Solar,5

Fossil,Car,25
Fossil,Home,5

Gas,Home,10

Solar,Home,5`
    },
    {
        name: 'Sequence Diagram',
        code: `sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    
    User->>+Frontend: Request data
    Frontend->>+Backend: Fetch data for user
    Backend-->>Frontend: Return data
    deactivate Backend
    
    alt Successful fetch
        Frontend-->>User: Display data
    else Error
        Frontend-->>User: Show error message
    end
    deactivate Frontend
    
    Note right of Backend: Data processing happens here`
    },
    {
        name: 'State Diagram',
        code: `stateDiagram-v2
    [*] --> Off
    
    state Off {
        [*] --> Idle
        Idle --> Active : Power On
    }
    
    state Active {
        [*] --> Running
        Running --> Paused : Pause
        Paused --> Running : Resume
    }
    
    Active --> Off : Power Off`
    },
    {
        name: 'Timeline',
        code: `timeline
    title Project Apollo Timeline
    2024-01-01 : Phase 1 Kickoff
    2024-02-15 : Milestone A Reached
               : UI/UX Design Complete
    2024-04-01 : Phase 2 - Development
    2024-06-30 : Beta Release
    2024-07-20 : Project Launch`
    },
    {
        name: 'User Journey',
        code: `journey
    title Customer Purchase Journey
    section Discovering the Product
        Research: 5: John
        Browsing: 3: Jane, John
    section Making a Decision
        Comparison: 5: John
        Adds to Cart: 1: Jane
    section Purchase
        Checkout: 5: Jane
        Receives Confirmation: 2: Jane`
    }
];
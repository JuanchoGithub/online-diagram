
export interface Shape {
    name: string;
    description: string;
    type: 'classic' | 'advanced';
    syntax: string;
    previewCode: string;
}

interface ShapeCategory {
    name: string;
    shapes: Shape[];
}

const classicShapes: Shape[] = [
    { name: 'Rectangle', description: 'A standard process or task.', type: 'classic', syntax: '[Text]', previewCode: 'flowchart TD; A[ ]' },
    { name: 'Rounded Rectangle', description: 'An alternative process or task.', type: 'classic', syntax: '(Text)', previewCode: 'flowchart TD; A( )' },
    { name: 'Stadium', description: 'A start or end point.', type: 'classic', syntax: '([Text])', previewCode: 'flowchart TD; A([ ])' },
    { name: 'Subroutine', description: 'A predefined process.', type: 'classic', syntax: '[[Text]]', previewCode: 'flowchart TD; A[[ ]]' },
    { name: 'Cylinder', description: 'Represents a database.', type: 'classic', syntax: '[(Text)]', previewCode: 'flowchart TD; A[( )]' },
    { name: 'Circle', description: 'A connector or circular start/end point.', type: 'classic', syntax: '((Text))', previewCode: 'flowchart TD; A(( ))' },
    { name: 'Double Circle', description: 'A final endpoint in a process.', type: 'classic', syntax: '(((Text)))', previewCode: 'flowchart TD; A((( )))' },
    { name: 'Rhombus', description: 'A decision point in a process.', type: 'classic', syntax: '{Text}', previewCode: 'flowchart TD; A{ }' },
    { name: 'Hexagon', description: 'A preparation step.', type: 'classic', syntax: '{{Text}}', previewCode: 'flowchart TD; A{{ }}' },
    { name: 'Asymmetric', description: 'An asymmetric shape, often for data.', type: 'classic', syntax: '>Text]', previewCode: 'flowchart TD; A> ]' },
    { name: 'Parallelogram', description: 'Represents input or output.', type: 'classic', syntax: '[/Text/]', previewCode: 'flowchart TD; A[/ /]' },
    { name: 'Parallelogram Alt', description: 'An alternative input/output shape.', type: 'classic', syntax: '[\\Text\\]', previewCode: 'flowchart TD; A[\\ \\]' },
    { name: 'Trapezoid', description: 'A manual operation.', type: 'classic', syntax: '[/Text\\]', previewCode: 'flowchart TD; A[/ \\]' },
    { name: 'Trapezoid Alt', description: 'An alternative manual operation.', type: 'classic', syntax: '[\\Text/]', previewCode: 'flowchart TD; A[\\ /]' },
];

const advancedShapes: Shape[] = [
    { name: 'Bang', description: 'Represents a bang or interrupt.', type: 'advanced', syntax: 'bang', previewCode: 'flowchart TD; A@{shape:bang}' },
    { name: 'Card', description: 'Represents a card.', type: 'advanced', syntax: 'card', previewCode: 'flowchart TD; A@{shape:card}' },
    { name: 'Cloud', description: 'Represents a cloud-based action or storage.', type: 'advanced', syntax: 'cloud', previewCode: 'flowchart TD; A@{shape:cloud}' },
    { name: 'Collate', description: 'Represents a collate operation.', type: 'advanced', syntax: 'collate', previewCode: 'flowchart TD; A@{shape:collate}' },
    { name: 'Com Link', description: 'A communication link.', type: 'advanced', syntax: 'com-link', previewCode: 'flowchart TD; A@{shape:com-link}' },
    { name: 'Comment', description: 'Adds a comment.', type: 'advanced', syntax: 'brace', previewCode: 'flowchart TD; A@{shape:brace}' },
    { name: 'Data I/O', description: 'Represents input or output.', type: 'advanced', syntax: 'lean-r', previewCode: 'flowchart TD; A@{shape:lean-r}' },
    { name: 'Database', description: 'Represents a database.', type: 'advanced', syntax: 'db', previewCode: 'flowchart TD; A@{shape:db}' },
    { name: 'Decision', description: 'A decision-making step.', type: 'advanced', syntax: 'diamond', previewCode: 'flowchart TD; A@{shape:diamond}' },
    { name: 'Delay', description: 'Represents a delay.', type: 'advanced', syntax: 'delay', previewCode: 'flowchart TD; A@{shape:delay}' },
    { name: 'Direct Access Storage', description: 'Direct access storage.', type: 'advanced', syntax: 'das', previewCode: 'flowchart TD; A@{shape:das}' },
    { name: 'Disk Storage', description: 'Represents disk storage.', type: 'advanced', syntax: 'disk', previewCode: 'flowchart TD; A@{shape:disk}' },
    { name: 'Display', description: 'Represents a display.', type: 'advanced', syntax: 'display', previewCode: 'flowchart TD; A@{shape:display}' },
    { name: 'Divided Process', description: 'A divided process shape.', type: 'advanced', syntax: 'div-proc', previewCode: 'flowchart TD; A@{shape:div-proc}' },
    { name: 'Document', description: 'Represents a document.', type: 'advanced', syntax: 'document', previewCode: 'flowchart TD; A@{shape:document}' },
    { name: 'Event', description: 'Represents an event.', type: 'advanced', syntax: 'event', previewCode: 'flowchart TD; A@{shape:event}' },
    { name: 'Extract', description: 'An extraction process.', type: 'advanced', syntax: 'extract', previewCode: 'flowchart TD; A@{shape:extract}' },
    { name: 'Fork/Join', description: 'A fork or join in process flow.', type: 'advanced', syntax: 'fork', previewCode: 'flowchart TD; A@{shape:fork}' },
    { name: 'Internal Storage', description: 'Represents internal storage.', type: 'advanced', syntax: 'internal-storage', previewCode: 'flowchart TD; A@{shape:internal-storage}' },
    { name: 'Junction', description: 'A junction point.', type: 'advanced', syntax: 'junction', previewCode: 'flowchart TD; A@{shape:junction}' },
    { name: 'Loop Limit', description: 'A loop limit step.', type: 'advanced', syntax: 'loop-limit', previewCode: 'flowchart TD; A@{shape:loop-limit}' },
    { name: 'Manual File', description: 'A manual file operation.', type: 'advanced', syntax: 'manual-file', previewCode: 'flowchart TD; A@{shape:manual-file}' },
    { name: 'Manual Input', description: 'A manual input step.', type: 'advanced', syntax: 'manual-input', previewCode: 'flowchart TD; A@{shape:manual-input}' },
    { name: 'Manual Operation', description: 'Represents a manual task.', type: 'advanced', syntax: 'manual', previewCode: 'flowchart TD; A@{shape:manual}' },
    { name: 'Multi-Document', description: 'Multiple documents.', type: 'advanced', syntax: 'docs', previewCode: 'flowchart TD; A@{shape:docs}' },
    { name: 'Multi-Process', description: 'Multiple processes.', type: 'advanced', syntax: 'procs', previewCode: 'flowchart TD; A@{shape:procs}' },
    { name: 'Paper Tape', description: 'Represents paper tape.', type: 'advanced', syntax: 'paper-tape', previewCode: 'flowchart TD; A@{shape:paper-tape}' },
    { name: 'Prepare', description: 'A preparation or condition step.', type: 'advanced', syntax: 'prepare', previewCode: 'flowchart TD; A@{shape:prepare}' },
    { name: 'Process', description: 'A standard process shape.', type: 'advanced', syntax: 'process', previewCode: 'flowchart TD; A@{shape:process}' },
    { name: 'Start/Stop', description: 'A starting or ending point.', type: 'advanced', syntax: 'start', previewCode: 'flowchart TD; A@{shape:start}' },
    { name: 'Stored Data', description: 'Represents stored data.', type: 'advanced', syntax: 'stored-data', previewCode: 'flowchart TD; A@{shape:stored-data}' },
    { name: 'Subprocess', description: 'A subprocess.', type: 'advanced', syntax: 'subproc', previewCode: 'flowchart TD; A@{shape:subproc}' },
    { name: 'Summary', description: 'Represents a summary.', type: 'advanced', syntax: 'summary', previewCode: 'flowchart TD; A@{shape:summary}' },
    { name: 'Tagged Document', description: 'A tagged document.', type: 'advanced', syntax: 'tag-doc', previewCode: 'flowchart TD; A@{shape:tag-doc}' },
    { name: 'Tagged Process', description: 'A tagged process.', type: 'advanced', syntax: 'tag-proc', previewCode: 'flowchart TD; A@{shape:tag-proc}' },
    { name: 'Terminal Point', description: 'A terminal point.', type: 'advanced', syntax: 'terminal', previewCode: 'flowchart TD; A@{shape:terminal}' },
    { name: 'Text Block', description: 'A block of text.', type: 'advanced', syntax: 'text', previewCode: 'flowchart TD; A@{shape:text}' },
];

const findShape = (name: string): Shape => {
    const allShapes = [...classicShapes, ...advancedShapes];
    const shape = allShapes.find(s => s.name === name);
    if (!shape) throw new Error(`Shape "${name}" not found!`);
    return shape;
};

export const SHAPE_CATEGORIES: ShapeCategory[] = [
    {
        name: 'Basic',
        shapes: [
            findShape('Rectangle'), findShape('Rounded Rectangle'), findShape('Rhombus'),
            findShape('Stadium'), findShape('Circle'), findShape('Parallelogram'),
            findShape('Cylinder'), findShape('Subroutine'),
        ],
    },
    {
        name: 'Flow Control',
        shapes: [
            findShape('Rhombus'), findShape('Decision'), findShape('Circle'),
            findShape('Double Circle'), findShape('Stadium'), findShape('Terminal Point'),
            findShape('Hexagon'), findShape('Prepare'), findShape('Junction'),
            findShape('Fork/Join'), findShape('Loop Limit'), findShape('Bang'),
            findShape('Event'), findShape('Start/Stop'),
        ],
    },
    {
        name: 'Process',
        shapes: [
            findShape('Rectangle'), findShape('Rounded Rectangle'), findShape('Subroutine'),
            findShape('Subprocess'), findShape('Divided Process'), findShape('Multi-Process'),
            findShape('Trapezoid'), findShape('Manual Operation'), findShape('Delay'),
            findShape('Collate'), findShape('Extract'), findShape('Summary'), findShape('Card'),
        ],
    },
    {
        name: 'Data & Storage',
        shapes: [
            findShape('Cylinder'), findShape('Database'), findShape('Internal Storage'),
            findShape('Stored Data'), findShape('Direct Access Storage'), findShape('Disk Storage'),
        ],
    },
    {
        name: 'I/O & Documents',
        shapes: [
            findShape('Parallelogram'), findShape('Asymmetric'), findShape('Data I/O'),
            findShape('Manual Input'), findShape('Display'), findShape('Document'),
            findShape('Multi-Document'), findShape('Paper Tape'), findShape('Manual File'),
            findShape('Tagged Document'),
        ],
    },
    {
        name: 'Annotations & Misc',
        shapes: [
            findShape('Comment'), findShape('Text Block'), findShape('Cloud'), findShape('Com Link'),
        ]
    }
];

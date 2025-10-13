import type { SyntaxDetail } from '../../types';

export const ADVANCED_SHAPES = [
    'bang', 'bolt', 'bow-rect', 'bow-tie-rectangle', 'brace', 'brace-l', 'brace-r', 
    'braces', 'card', 'circ', 'circle', 'cloud', 'collate', 'com-link', 'comment', 
    'cross-circ', 'crossed-circle', 'curv-trap', 'curved-trapezoid', 'cyl', 
    'cylinder', 'das', 'database', 'db', 'dbl-circ', 'decision', 'delay', 'diam', 
    'diamond', 'disk', 'display', 'div-proc', 'div-rect', 'divided-process', 
    'divided-rectangle', 'doc', 'docs', 'document', 'documents', 'double-circle', 
    'event', 'extract', 'f-circ', 'filled-circle', 'flag', 'flip-tri', 
    'flipped-triangle', 'fork', 'fr-circ', 'fr-rect', 'framed-circle', 
    'framed-rectangle', 'h-cyl', 'half-rounded-rectangle', 'hex', 'hexagon', 
    'horizontal-cylinder', 'hourglass', 'in-out', 'internal-storage', 
    'inv-trapezoid', 'join', 'junction', 'lean-l', 'lean-left', 'lean-r', 
    'lean-right', 'lightning-bolt', 'lin-cyl', 'lin-doc', 'lin-proc', 'lin-rect', 
    'lined-cylinder', 'lined-document', 'lined-process', 'lined-rectangle', 
    'loop-limit', 'manual', 'manual-file', 'manual-input', 'notch-pent', 
    'notch-rect', 'notched-pentagon', 'notched-rectangle', 'odd', 'out-in', 
    'paper-tape', 'pill', 'prepare', 'priority', 'proc', 'process', 'processes', 
    'procs', 'question', 'rect', 'rectangle', 'rounded', 'shaded-process', 
    'sl-rect', 'sloped-rectangle', 'sm-circ', 'small-circle', 'st-doc', 
    'st-rect', 'stadium', 'stacked-document', 'stacked-rectangle', 'start', 
    'stop', 'stored-data', 'subproc', 'subprocess', 'subroutine', 'summary', 
    'tag-doc', 'tag-proc', 'tag-rect', 'tagged-document', 'tagged-process', 
    'tagged-rectangle', 'terminal', 'text', 'trap-b', 'trap-t', 'trapezoid', 
    'trapezoid-bottom', 'trapezoid-top', 'tri', 'triangle', 'win-pane', 
    'window-pane'
];

export const getAdvancedShapesDetail = (): SyntaxDetail => ({
    keywords: ADVANCED_SHAPES,
    explanation: {
        title: 'Value: Shape Name',
        description: `Specifies the node shape from an expanded library. Many shapes are available, such as 'bang', 'cloud', 'database', and 'document'. See the tutorial for a complete list of all shapes and their aliases.`,
        example: 'shape: cloud'
    }
});
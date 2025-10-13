import type { SyntaxDetail } from '../../types';

export const ADVANCED_SHAPES = [
    'card', 'cloud', 'cylinder', 'document', 'event', 
    'file', 'folder', 'hexagon', 'manual-file', 'manual-input', 
    'package', 'prepare', 'process', 'queue', 'star', 
    'subroutine', 'terminal', 'actor', 'choice', 'component', 
    'database', 'ellipse', 'circle', 'diamond', 'trapezoid', 
    'parallelogram'
];

export const getAdvancedShapesDetail = (): SyntaxDetail => ({
    keywords: ADVANCED_SHAPES,
    explanation: {
        title: 'Value: Shape Name',
        description: `A specific shape for the node. Other available shapes include: ${ADVANCED_SHAPES.join(', ')}.`,
        example: 'shape: cloud'
    }
});

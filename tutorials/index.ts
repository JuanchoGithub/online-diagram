import type { TutorialContent } from '../types';
import { flowchartTutorial } from './flowchart';
import { sequenceTutorial } from './sequence';
import { erTutorial } from './er';

export const TUTORIALS: Record<string, TutorialContent> = {
  flowchart: flowchartTutorial,
  sequence: sequenceTutorial,
  er: erTutorial,
};

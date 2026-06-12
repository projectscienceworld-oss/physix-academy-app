export type PhysicsTopic = 
  | 'Mechanics' 
  | 'Waves' 
  | 'Electromagnetism' 
  | 'Optics' 
  | 'Quantum' 
  | 'Thermodynamics' 
  | 'Modern Physics';

export interface VideoLecture {
  id: string;
  title: string;
  topic: PhysicsTopic;
  chapter: string;
  duration: string;
  thumbnail: string;
  description: string;
  videoUrl: string;
  isWatched: boolean;
}

export interface Simulation {
  id: string;
  title: string;
  topic: PhysicsTopic;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  launchUrl: string;
  observationGuide: string;
  thumbnail: string;
}

export interface ClassSession {
  id: string;
  title: string;
  date: string;
  time: string;
  topic: PhysicsTopic;
  link: string;
  isRecording?: boolean;
}

export interface RoutineSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  topic: PhysicsTopic;
  room: string;
  note?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: PhysicsTopic;
  difficulty: 1 | 2 | 3 | 4; // 1: Conceptual, 2: Applied, 3: Intermediate, 4: Advanced
  questions: QuizQuestion[];
  timeLimitMinutes?: number;
}

export interface NumericalProblem {
  id: string;
  topic: PhysicsTopic;
  subTopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Challenge';
  statement: string;
  solutionSteps: string[];
  keyFormula: string;
  answer: string;
  status: 'Solved' | 'Unsolved' | 'Needs Revision';
  imageUrl?: string;
}

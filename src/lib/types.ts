import { Timestamp } from 'firebase/firestore';

// ─── Physics Taxonomy ────────────────────────────────────────────────────────
export type PhysicsTopic =
  | 'Mechanics'
  | 'Waves'
  | 'Electromagnetism'
  | 'Optics'
  | 'Quantum'
  | 'Thermodynamics'
  | 'Modern Physics';

// ─── User / Auth ─────────────────────────────────────────────────────────────
export type UserRole = 'teacher' | 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  batch_ids: string[]; // for students: batches they belong to; for teachers: batches they own
  created_at: Timestamp;
  last_active: Timestamp;
}

// ─── Classes / Batches ────────────────────────────────────────────────────────
export interface Class {
  id: string;
  name: string;
  teacher_id: string;
  student_ids: string[];
  class_code: string; // 6-char join code
  created_at: Timestamp;
}

// ─── Materials ────────────────────────────────────────────────────────────────
export type MaterialType = 'video' | 'audio' | 'pdf' | 'link';

export interface Material {
  id: string;
  batch_id: string;
  type: MaterialType;
  title: string;
  file_url: string;
  file_id?: string;
  topic: PhysicsTopic;
  uploaded_by: string; // uid
  uploaded_at: Timestamp;
  description: string;
  thumbnail_url?: string;
  duration?: string;
  completed_by: string[]; // student uids who marked complete
}

// ─── Questions ────────────────────────────────────────────────────────────────
export type QuestionType = 'mcq' | 'numerical';
export type Difficulty = 1 | 2 | 3 | 4; // 1=Conceptual, 2=Applied, 3=Intermediate, 4=Advanced

export interface Question {
  id: string;
  topic: PhysicsTopic;
  difficulty: Difficulty;
  type: QuestionType;
  question_text: string; // supports LaTeX via KaTeX
  options: string[]; // MCQ: 4 options; numerical: []
  correct_answer: string;
  explanation: string;
  solution_steps?: string[]; // for numerical
  key_formula?: string;
  image_url?: string;
  file_id?: string;
  created_by: string; // teacher uid
  created_at: Timestamp;
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export type QuizStatus = 'draft' | 'published';

export interface Quiz {
  id: string;
  title: string;
  batch_id: string;
  topic: PhysicsTopic;
  difficulty: Difficulty;
  question_ids: string[];
  time_limit: number; // minutes
  scheduled_open: Timestamp;
  scheduled_close: Timestamp;
  status: QuizStatus;
  show_explanations: boolean;
  created_by: string;
  created_at: Timestamp;
}

// ─── Quiz Attempts ────────────────────────────────────────────────────────────
export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string>; // question_id → answer
  score: number; // 0-100
  time_taken: number; // seconds
  submitted_at: Timestamp;
}

// ─── Live Classes ─────────────────────────────────────────────────────────────
export interface LiveClass {
  id: string;
  batch_id: string;
  title: string;
  meet_link: string;
  scheduled_time: Timestamp;
  recording_url?: string;
  description?: string;
  created_by: string;
}

// ─── Routine ──────────────────────────────────────────────────────────────────
export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface RoutineSlot {
  id: string;
  batch_id: string;
  day: WeekDay;
  time_slot: string; // e.g. "09:00 - 10:30"
  topic: PhysicsTopic;
  note?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType = 'new_material' | 'quiz_published' | 'class_scheduled';

export interface Notification {
  id: string;
  batch_id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: Timestamp;
  read_by: string[]; // student uids
}

// ─── Student Progress (computed) ─────────────────────────────────────────────
export interface StudentProgress {
  student: UserProfile;
  materials_completed: number;
  total_materials: number;
  quizzes_attempted: number;
  total_quizzes: number;
  avg_score: number;
  last_active: Timestamp | null;
}

// ─── Legacy types (kept for simulations page compatibility) ──────────────────
export interface Simulation {
  id: string;
  title: string;
  topic: PhysicsTopic;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  launchUrl: string;
  observationGuide: string;
  thumbnail: string;
}

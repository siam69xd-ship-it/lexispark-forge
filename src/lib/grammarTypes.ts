// Grammar Book Types
export interface GrammarExample {
  bengali?: string;
  english?: string;
  question?: string;
  answer?: string;
  subject?: string;
}

export interface GrammarSection {
  section?: string;
  text?: string;
  examples?: GrammarExample[];
}

export interface GrammarRule {
  number?: number;
  description?: string;
  examples?: string[];
  rule?: string;
  example?: string;
}

export interface ShortcutTip {
  tip: string;
  examples?: string[];
}

export interface PracticeExercise {
  bengali: string;
  english: string;
}

export interface Practice {
  bengali?: string;
  english?: string;
}

export interface Pronoun {
  pronoun: string;
  usage: string;
  example: string;
}

export interface TenseStructure {
  tense: string;
  structure: string;
  examples: string[];
}

export interface CommonUse {
  use: string;
  description?: string;
  rule?: string;
  verbs?: string[];
  examples: string[];
}

export interface Connector {
  category: string;
  words: string[];
  examples: string[];
}

export interface ProjectSentence {
  bengali: string;
  english: string;
}

export interface Project {
  number: number;
  title?: string;
  bengali?: string;
  english?: string;
  passage?: string;
  translation?: string;
  sentences?: ProjectSentence[];
  steps?: string[];
  headline?: string;
}

// Chapter 8 - Essential Grammar types
export interface VerbType {
  type: string;
  description?: string;
  example?: string;
  structures?: string[];
  subtypes?: string[];
  examples?: string[];
}

export interface TopicContent {
  topic: string;
  count?: number;
  common_rules?: string[];
  types?: VerbType[];
  rules?: GrammarRule[];
  modals?: ModalAux[];
  active_to_passive?: string;
  tense_structures?: string[];
  definitions?: Definition[];
}

export interface ModalAux {
  modal: string;
  uses: string[];
  examples: string[];
}

export interface Definition {
  term: string;
  description: string;
  example: string;
}

export interface GrammarPart {
  part: string;
  topics: TopicContent[];
}

// Chapter 9 - Presentation types
export interface PresentationSystem {
  system: number;
  english: string;
  bangla: string;
}

export interface PresentationPhrase {
  bengali: string;
  english: string;
}

export interface GrammarChapter {
  chapter: number;
  title: string;
  content?: GrammarSection[];
  rules?: GrammarRule[];
  shortcut_tips?: ShortcutTip[];
  practice?: Practice;
  pronouns?: Pronoun[];
  practice_exercises?: PracticeExercise[];
  tenses?: TenseStructure[];
  key_concept?: string;
  common_uses?: CommonUse[];
  connectors?: Connector[];
  basic_formula?: string;
  steps?: string[];
  projects?: Project[];
  ict_topic?: { sentences: GrammarExample[] };
  environment_topic?: { bengali: string; english: string; verb_ing_usage: string[] };
  corona_pandemic_example?: { bengali: string; english: string; linking_words_used: string[] };
  // Chapter 8 - Essential Grammar
  parts?: GrammarPart[];
  // Chapter 9 - Presentation
  starting_systems?: PresentationSystem[];
  finishing_systems?: PresentationSystem[];
  presentation_phrases?: PresentationPhrase[];
}

export interface GrammarBook {
  book: string;
  chapters: GrammarChapter[];
}

// Quiz question for grammar
export interface GrammarQuizQuestion {
  id: string;
  chapterId: number;
  type: 'fill-blank' | 'correct-verb' | 'translate' | 'identify';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  rule?: string;
}

// Progress tracking
export interface ChapterProgress {
  chapterId: number;
  lessonCompleted: boolean;
  practiceScore: number | null;
  practiceCompleted: boolean;
  lastAttempt?: string;
}

// AI Feedback response
export interface AIFeedbackResponse {
  score: number;
  isCorrect: boolean;
  strengths: string[];
  improvements: string[];
  correctedVersion: string;
  grammarTips: string[];
  overallComment: string;
}

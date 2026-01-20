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

export interface Project {
  number: number;
  title?: string;
  bengali?: string;
  english?: string;
  passage?: string;
  translation?: string;
  sentences?: { bengali: string; english: string }[];
  steps?: string[];
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

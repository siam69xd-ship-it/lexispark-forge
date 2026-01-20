import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GrammarBook, GrammarChapter, ChapterProgress } from '@/lib/grammarTypes';

interface GrammarContextType {
  grammarBook: GrammarBook | null;
  chapters: GrammarChapter[];
  loading: boolean;
  error: string | null;
  progress: ChapterProgress[];
  getChapter: (id: number) => GrammarChapter | undefined;
  markLessonComplete: (chapterId: number) => void;
  savePracticeScore: (chapterId: number, score: number) => void;
  getChapterProgress: (chapterId: number) => ChapterProgress | undefined;
  getTotalProgress: () => { completed: number; total: number; percentage: number };
}

const GrammarContext = createContext<GrammarContextType | undefined>(undefined);

export function GrammarProvider({ children }: { children: ReactNode }) {
  const [grammarBook, setGrammarBook] = useState<GrammarBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ChapterProgress[]>([]);

  useEffect(() => {
    async function loadGrammar() {
      try {
        const response = await fetch('/data/essential_grammar.json');
        if (!response.ok) throw new Error('Failed to load grammar data');
        const data = await response.json();
        setGrammarBook(data);
        
        // Load progress from localStorage
        const savedProgress = localStorage.getItem('shobdohub_grammar_progress');
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load grammar');
        console.error('Error loading grammar:', e);
      } finally {
        setLoading(false);
      }
    }
    loadGrammar();
  }, []);

  const chapters = grammarBook?.chapters || [];

  const getChapter = (id: number) => chapters.find(c => c.chapter === id);

  const markLessonComplete = (chapterId: number) => {
    setProgress(prev => {
      const existing = prev.find(p => p.chapterId === chapterId);
      const updated = existing
        ? prev.map(p => p.chapterId === chapterId ? { ...p, lessonCompleted: true } : p)
        : [...prev, { chapterId, lessonCompleted: true, practiceScore: null, practiceCompleted: false }];
      localStorage.setItem('shobdohub_grammar_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const savePracticeScore = (chapterId: number, score: number) => {
    setProgress(prev => {
      const existing = prev.find(p => p.chapterId === chapterId);
      const updated = existing
        ? prev.map(p => p.chapterId === chapterId 
            ? { ...p, practiceScore: Math.max(p.practiceScore || 0, score), practiceCompleted: true, lastAttempt: new Date().toISOString() } 
            : p)
        : [...prev, { chapterId, lessonCompleted: false, practiceScore: score, practiceCompleted: true, lastAttempt: new Date().toISOString() }];
      localStorage.setItem('shobdohub_grammar_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const getChapterProgress = (chapterId: number) => progress.find(p => p.chapterId === chapterId);

  const getTotalProgress = () => {
    const total = chapters.length * 2; // lesson + practice per chapter
    const completed = progress.reduce((acc, p) => {
      let count = 0;
      if (p.lessonCompleted) count++;
      if (p.practiceCompleted) count++;
      return acc + count;
    }, 0);
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <GrammarContext.Provider value={{
      grammarBook,
      chapters,
      loading,
      error,
      progress,
      getChapter,
      markLessonComplete,
      savePracticeScore,
      getChapterProgress,
      getTotalProgress,
    }}>
      {children}
    </GrammarContext.Provider>
  );
}

export function useGrammar() {
  const context = useContext(GrammarContext);
  if (!context) {
    throw new Error('useGrammar must be used within a GrammarProvider');
  }
  return context;
}

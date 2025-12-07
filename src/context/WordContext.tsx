import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Word, parseWordsFromText, parseBanglaFile, setBanglaMap } from '@/lib/wordParser';

interface WordContextType {
  words: Word[];
  loading: boolean;
  error: string | null;
  flashcards: Set<string>;
  memorized: Set<string>;
  addToFlashcards: (wordId: string) => void;
  removeFromFlashcards: (wordId: string) => void;
  markAsMemorized: (wordId: string) => void;
  getWordById: (id: string) => Word | undefined;
  searchWords: (query: string) => Word[];
  filterByLetter: (letter: string) => Word[];
  filterByPartOfSpeech: (pos: string) => Word[];
  filterByDifficulty: (difficulty: string) => Word[];
}

const WordContext = createContext<WordContextType | undefined>(undefined);

export function WordProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Set<string>>(new Set());
  const [memorized, setMemorized] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadWords() {
      try {
        // Load both files in parallel
        const [englishResponse, banglaResponse] = await Promise.all([
          fetch('/data/words_english.txt'),
          fetch('/data/words_bangla.txt')
        ]);
        
        if (!englishResponse.ok) throw new Error('Failed to load English words file');
        if (!banglaResponse.ok) throw new Error('Failed to load Bangla words file');
        
        const [englishText, banglaText] = await Promise.all([
          englishResponse.text(),
          banglaResponse.text()
        ]);
        
        // Parse Bangla file first and set the map
        const banglaMap = parseBanglaFile(banglaText);
        setBanglaMap(banglaMap);
        
        // Parse English file (will use banglaMap for Bangla meanings)
        const parsedWords = parseWordsFromText(englishText);
        setWords(parsedWords);
        
        console.log(`Loaded ${parsedWords.length} words with ${banglaMap.size} Bangla translations`);
        
        // Load saved flashcards from localStorage
        const savedFlashcards = localStorage.getItem('vocaforge_flashcards');
        if (savedFlashcards) {
          setFlashcards(new Set(JSON.parse(savedFlashcards)));
        }
        const savedMemorized = localStorage.getItem('vocaforge_memorized');
        if (savedMemorized) {
          setMemorized(new Set(JSON.parse(savedMemorized)));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load words');
        console.error('Error loading words:', e);
      } finally {
        setLoading(false);
      }
    }
    loadWords();
  }, []);

  const addToFlashcards = (wordId: string) => {
    setFlashcards(prev => {
      const updated = new Set(prev);
      updated.add(wordId);
      localStorage.setItem('vocaforge_flashcards', JSON.stringify([...updated]));
      return updated;
    });
  };

  const removeFromFlashcards = (wordId: string) => {
    setFlashcards(prev => {
      const updated = new Set(prev);
      updated.delete(wordId);
      localStorage.setItem('vocaforge_flashcards', JSON.stringify([...updated]));
      return updated;
    });
  };

  const markAsMemorized = (wordId: string) => {
    setMemorized(prev => {
      const updated = new Set(prev);
      updated.add(wordId);
      localStorage.setItem('vocaforge_memorized', JSON.stringify([...updated]));
      return updated;
    });
    removeFromFlashcards(wordId);
  };

  const getWordById = (id: string) => words.find(w => w.id === id);

  const searchWords = (query: string) => {
    const q = query.toLowerCase();
    return words.filter(w => 
      w.word.toLowerCase().includes(q) ||
      w.smartMeaning.toLowerCase().includes(q) ||
      w.banglaMeaning.toLowerCase().includes(q) ||
      w.synonyms.some(s => s.toLowerCase().includes(q))
    );
  };

  const filterByLetter = (letter: string) => 
    words.filter(w => w.firstLetter === letter.toUpperCase());

  const filterByPartOfSpeech = (pos: string) => 
    words.filter(w => w.partOfSpeech === pos);

  const filterByDifficulty = (difficulty: string) => 
    words.filter(w => w.difficulty === difficulty);

  return (
    <WordContext.Provider value={{
      words,
      loading,
      error,
      flashcards,
      memorized,
      addToFlashcards,
      removeFromFlashcards,
      markAsMemorized,
      getWordById,
      searchWords,
      filterByLetter,
      filterByPartOfSpeech,
      filterByDifficulty,
    }}>
      {children}
    </WordContext.Provider>
  );
}

export function useWords() {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useWords must be used within a WordProvider');
  }
  return context;
}

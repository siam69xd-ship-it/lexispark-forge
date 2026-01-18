import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Languages, BookOpen, Info, Lightbulb, GraduationCap } from 'lucide-react';
import { Passage } from '@/lib/passageParser';
import { Word } from '@/lib/wordParser';
import { useWords } from '@/context/WordContext';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import WordDetailPanel from '@/components/WordDetailPanel';
import { Button } from '@/components/ui/button';

interface PassageViewProps {
  passage: Passage;
  onBack: () => void;
}

export default function PassageView({ passage, onBack }: PassageViewProps) {
  const [showEnglish, setShowEnglish] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const { words } = useWords();
  const { user } = useAuth();
  const { trackWordView, markWordAsLearned, toggleFavorite, isWordLearned, isWordFavorite } = useProgress();

  // Close panel on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedWord(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const passageWordMap = useMemo(() => {
    const map = new Map<string, Word>();
    
    passage.words.forEach(passageWord => {
      const normalizedWord = passageWord.toLowerCase().replace(/[^a-z]/g, '');
      
      const found = words.find(dbWord => {
        const dbNormalized = dbWord.id.toLowerCase();
        return dbNormalized === normalizedWord || 
               dbWord.word.toLowerCase() === passageWord.toLowerCase();
      });
      
      if (found) {
        map.set(passageWord.toUpperCase(), found);
        map.set(passageWord.toLowerCase(), found);
        map.set(normalizedWord, found);
      }
    });
    
    return map;
  }, [passage.words, words]);

  const findWordData = useCallback((text: string): Word | null => {
    const normalized = text.toLowerCase().replace(/[^a-z]/g, '');
    return passageWordMap.get(text.toUpperCase()) || 
           passageWordMap.get(text.toLowerCase()) || 
           passageWordMap.get(normalized) || null;
  }, [passageWordMap]);

  const handleWordClick = (wordData: Word) => {
    setSelectedWord(wordData);
    if (user) {
      trackWordView(wordData.id, wordData.word);
    }
  };

  const renderHighlightedText = useCallback((text: string, isEnglish: boolean) => {
    if (!text) return null;

    let processedText = text;
    if (isEnglish) {
      processedText = text.replace(/\s*\([^)]*[\u0980-\u09FF][^)]*\)/g, '');
    }

    const wordPatterns = passage.words.map(w => 
      w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    if (!wordPatterns) return <span>{processedText}</span>;

    const regex = new RegExp(`\\b(${wordPatterns})\\b`, 'gi');
    const parts = processedText.split(regex);

    return parts.map((part, index) => {
      const wordData = findWordData(part);
      
      if (wordData) {
        const isActive = selectedWord?.id === wordData.id;
        
        return (
          <motion.span
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleWordClick(wordData)}
            className={`
              inline-block cursor-pointer font-semibold px-1 py-0.5 mx-0.5 rounded-md 
              transition-all duration-200 underline decoration-2 decoration-primary/40 underline-offset-2
              hover:decoration-primary hover:bg-primary/10
              ${isActive ? 'bg-primary/20 decoration-primary ring-2 ring-primary/30' : ''}
            `}
          >
            {part}
          </motion.span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [passage.words, findWordData, selectedWord, user]);

  const matchedWordsCount = useMemo(() => {
    return passage.words.filter(w => findWordData(w)).length;
  }, [passage.words, findWordData]);

  const wordsByDifficulty = useMemo(() => {
    const grouped = { easy: [] as string[], medium: [] as string[], hard: [] as string[] };
    passage.words.forEach(word => {
      const wordData = findWordData(word);
      if (wordData) {
        grouped[wordData.difficulty].push(word);
      }
    });
    return grouped;
  }, [passage.words, findWordData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Passages</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={() => setShowEnglish(!showEnglish)}
                className={`
                  flex items-center gap-2.5 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300
                  ${showEnglish 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                `}
              >
                <Languages className="w-4 h-4" />
                {showEnglish ? 'English' : 'বাংলা'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-36 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Passage Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-5">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Passage {passage.id}</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-4 tracking-tight leading-tight">
              {passage.title}
            </h1>
            
            <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm max-w-md mx-auto">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Click on underlined words to explore meanings and usage
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center items-center gap-6 mb-10 p-4 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-foreground font-medium">{wordsByDifficulty.easy.length} Beginner</span>
            </div>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-foreground font-medium">{wordsByDifficulty.medium.length} Intermediate</span>
            </div>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-sm text-foreground font-medium">{wordsByDifficulty.hard.length} Advanced</span>
            </div>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <div className="text-sm text-muted-foreground">
              {matchedWordsCount} of {passage.words.length} words linked
            </div>
          </motion.div>

          {/* Reading Area */}
          <AnimatePresence mode="wait">
            <motion.article
              key={showEnglish ? 'english' : 'bangla'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Language Badge */}
              <div className="mb-6">
                <span className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  ${showEnglish 
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}
                `}>
                  {showEnglish ? '🇬🇧 English Version' : '🇧🇩 বাংলা সংস্করণ'}
                </span>
              </div>
              
              {/* Passage Content */}
              <div className="relative p-8 sm:p-10 md:p-12 rounded-2xl bg-card border border-border shadow-sm">
                {/* Decorative Quote */}
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl text-primary font-serif">"</span>
                </div>
                
                <div 
                  className="text-lg sm:text-xl text-foreground leading-[2.2] sm:leading-[2.4] selection:bg-primary/20"
                  style={{ 
                    fontFamily: showEnglish 
                      ? "'IBM Plex Serif', 'Georgia', serif" 
                      : "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
                  }}
                >
                  {renderHighlightedText(
                    showEnglish ? passage.englishText : passage.banglaText,
                    showEnglish
                  )}
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          {/* Vocabulary Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Vocabulary Words
                </h2>
                <p className="text-sm text-muted-foreground">
                  {passage.words.length} words to explore in this passage
                </p>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex flex-wrap gap-2.5">
                {passage.words.map((word, i) => {
                  const wordData = findWordData(word);
                  const isActive = selectedWord?.word.toLowerCase() === word.toLowerCase();
                  
                  const difficultyStyles = wordData ? {
                    easy: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
                    medium: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40',
                    hard: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40',
                  }[wordData.difficulty] : 'bg-muted text-muted-foreground border-transparent';
                  
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => wordData && handleWordClick(wordData)}
                      disabled={!wordData}
                      className={`
                        px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                        ${difficultyStyles}
                        ${wordData ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}
                        ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                      `}
                    >
                      {word.toLowerCase()}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Word Detail Side Panel */}
      <WordDetailPanel
        word={selectedWord}
        isOpen={!!selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
}

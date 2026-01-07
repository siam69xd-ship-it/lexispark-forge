import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Languages, BookOpen, Info } from 'lucide-react';
import { Passage } from '@/lib/passageParser';
import { Word } from '@/lib/wordParser';
import { useWords } from '@/context/WordContext';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import WordTooltip from '@/components/WordTooltip';
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
        const difficultyStyles = {
          easy: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 hover:bg-green-100 dark:hover:bg-green-500/20',
          medium: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20',
          hard: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20',
        };
        
        return (
          <motion.span
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedWord(wordData)}
            className={`
              inline-block cursor-pointer font-semibold px-1.5 py-0.5 mx-0.5 rounded-md 
              border transition-all duration-200
              ${difficultyStyles[wordData.difficulty]}
            `}
          >
            {part}
          </motion.span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [passage.words, findWordData]);

  const matchedWordsCount = useMemo(() => {
    return passage.words.filter(w => findWordData(w)).length;
  }, [passage.words, findWordData]);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Passages
            </Button>
            
            <button
              onClick={() => setShowEnglish(!showEnglish)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200
                ${showEnglish 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
              `}
            >
              <Languages className="w-4 h-4" />
              {showEnglish ? 'English' : 'বাংলা'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Title */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Passage {passage.id}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4 tracking-tight">
            {passage.title}
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Info className="w-4 h-4" />
            Click on highlighted words to explore their meanings
          </p>
        </motion.header>

        {/* Difficulty Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center items-center gap-6 mb-10 p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-foreground">Easy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-sm text-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-foreground">Hard</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {matchedWordsCount} of {passage.words.length} words matched
          </div>
        </motion.div>

        {/* Passage Text */}
        <AnimatePresence mode="wait">
          <motion.article
            key={showEnglish ? 'english' : 'bangla'}
            initial={{ opacity: 0, x: showEnglish ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: showEnglish ? -30 : 30 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl bg-card border border-border p-6 md:p-8 mb-10"
          >
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                showEnglish 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {showEnglish ? '🇬🇧 English Version' : '🇧🇩 বাংলা সংস্করণ'}
              </span>
            </div>
            
            <div 
              className="text-lg md:text-xl text-foreground leading-loose"
              style={{ 
                fontFamily: showEnglish ? 'inherit' : "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
                lineHeight: '2.2'
              }}
            >
              {renderHighlightedText(
                showEnglish ? passage.englishText : passage.banglaText,
                showEnglish
              )}
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Vocabulary Words */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-card border border-border"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Vocabulary Words ({passage.words.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {passage.words.map((word, i) => {
              const wordData = findWordData(word);
              const difficultyStyles = wordData ? {
                easy: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30 hover:bg-green-100 dark:hover:bg-green-500/20',
                medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20',
                hard: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20',
              }[wordData.difficulty] : 'bg-muted text-muted-foreground border-transparent';
              
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => wordData && setSelectedWord(wordData)}
                  disabled={!wordData}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all border
                    ${difficultyStyles}
                    ${wordData ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  {word.toLowerCase()}
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* Word Tooltip Modal */}
      <WordTooltip
        word={selectedWord}
        isOpen={!!selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
}

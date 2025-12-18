import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Languages, BookOpen, Info } from 'lucide-react';
import { Passage } from '@/lib/passageParser';
import { Word } from '@/lib/wordParser';
import { useWords } from '@/context/WordContext';
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

  // Create a map of passage words to their Word objects with better matching
  const passageWordMap = useMemo(() => {
    const map = new Map<string, Word>();
    
    passage.words.forEach(passageWord => {
      // Normalize the word for matching
      const normalizedWord = passageWord.toLowerCase().replace(/[^a-z]/g, '');
      
      // Try to find the word in our database
      const found = words.find(dbWord => {
        const dbNormalized = dbWord.id.toLowerCase();
        return dbNormalized === normalizedWord || 
               dbWord.word.toLowerCase() === passageWord.toLowerCase();
      });
      
      if (found) {
        // Store with multiple keys for easier lookup
        map.set(passageWord.toUpperCase(), found);
        map.set(passageWord.toLowerCase(), found);
        map.set(normalizedWord, found);
      }
    });
    
    return map;
  }, [passage.words, words]);

  // Find word data by text
  const findWordData = useCallback((text: string): Word | null => {
    const normalized = text.toLowerCase().replace(/[^a-z]/g, '');
    return passageWordMap.get(text.toUpperCase()) || 
           passageWordMap.get(text.toLowerCase()) || 
           passageWordMap.get(normalized) || null;
  }, [passageWordMap]);

  // Highlight words in text
  const renderHighlightedText = useCallback((text: string, isEnglish: boolean) => {
    if (!text) return null;

    // For English text, remove the inline translations (stuff in parentheses with Bangla)
    let processedText = text;
    if (isEnglish) {
      // Remove Bangla meanings in parentheses like (প্রশমিত হওয়া)
      processedText = text.replace(/\s*\([^)]*[\u0980-\u09FF][^)]*\)/g, '');
    }

    // Create regex pattern for all passage words
    const wordPatterns = passage.words.map(w => 
      w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    if (!wordPatterns) return <span>{processedText}</span>;

    const regex = new RegExp(`\\b(${wordPatterns})\\b`, 'gi');
    const parts = processedText.split(regex);

    return parts.map((part, index) => {
      const wordData = findWordData(part);
      
      if (wordData) {
        const difficultyColors = {
          easy: 'text-green-400 bg-green-500/10 hover:bg-green-500/25 border-green-500/30',
          medium: 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/25 border-yellow-500/30',
          hard: 'text-red-400 bg-red-500/10 hover:bg-red-500/25 border-red-500/30',
        };
        
        return (
          <motion.span
            key={index}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedWord(wordData)}
            className={`
              inline-block cursor-pointer font-bold px-1.5 py-0.5 mx-0.5 rounded-md 
              border transition-all duration-200
              ${difficultyColors[wordData.difficulty]}
              shadow-sm hover:shadow-md
            `}
          >
            {part}
          </motion.span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [passage.words, findWordData]);

  // Count matched words
  const matchedWordsCount = useMemo(() => {
    return passage.words.filter(w => findWordData(w)).length;
  }, [passage.words, findWordData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 glass-strong border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEnglish(!showEnglish)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-300
                ${showEnglish 
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30' 
                  : 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'}
              `}
            >
              <Languages className="w-4 h-4" />
              {showEnglish ? 'English' : 'বাংলা'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Passage {passage.id}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            {passage.title}
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            Click on highlighted words to see their meanings
          </p>
        </motion.div>

        {/* Word Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-6 mb-8 p-4 rounded-2xl bg-card/50 border border-border/50"
        >
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></span>
            <span className="text-sm font-medium text-foreground">Easy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"></span>
            <span className="text-sm font-medium text-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-400 shadow-lg shadow-red-400/50"></span>
            <span className="text-sm font-medium text-foreground">Hard</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {matchedWordsCount}/{passage.words.length} words matched
          </div>
        </motion.div>

        {/* Passage Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showEnglish ? 'english' : 'bangla'}
            initial={{ opacity: 0, x: showEnglish ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: showEnglish ? -50 : 50 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl p-6 md:p-8 border border-border/50 shadow-card"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                showEnglish 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-primary/20 text-primary'
              }`}>
                {showEnglish ? '🇬🇧 English Version' : '🇧🇩 বাংলা সংস্করণ'}
              </span>
            </div>
            
            <div 
              className="text-lg md:text-xl leading-loose text-foreground"
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
          </motion.div>
        </AnimatePresence>

        {/* Words in this passage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 rounded-3xl bg-card/50 border border-border/50"
        >
          <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Vocabulary Words ({passage.words.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {passage.words.map((word, i) => {
              const wordData = findWordData(word);
              const difficultyColors = wordData ? {
                easy: 'bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25',
                medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/25',
                hard: 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25',
              }[wordData.difficulty] : 'bg-muted/50 text-muted-foreground border-muted';
              
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => wordData && setSelectedWord(wordData)}
                  disabled={!wordData}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-semibold transition-all border
                    ${difficultyColors}
                    ${wordData ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  {word.toLowerCase()}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
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

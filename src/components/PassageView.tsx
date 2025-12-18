import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Languages, BookOpen } from 'lucide-react';
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
  const { words, getWordById } = useWords();

  // Create a map of passage words to their Word objects
  const passageWordMap = useMemo(() => {
    const map = new Map<string, Word>();
    passage.words.forEach(w => {
      const wordLower = w.toLowerCase().replace(/[^a-z]/g, '');
      const found = words.find(word => word.id === wordLower);
      if (found) {
        map.set(w.toUpperCase(), found);
        map.set(w.toLowerCase(), found);
      }
    });
    return map;
  }, [passage.words, words]);

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
      const upperPart = part.toUpperCase();
      const wordData = passageWordMap.get(upperPart) || passageWordMap.get(part.toLowerCase());
      
      if (wordData) {
        return (
          <motion.span
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedWord(wordData)}
            className={`
              inline-block cursor-pointer font-bold px-1 rounded-md transition-all duration-200
              ${wordData.difficulty === 'easy' 
                ? 'text-green-400 hover:bg-green-500/20' 
                : wordData.difficulty === 'medium' 
                ? 'text-yellow-400 hover:bg-yellow-500/20' 
                : 'text-red-400 hover:bg-red-500/20'}
              hover:shadow-glow
            `}
          >
            {part}
          </motion.span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [passage.words, passageWordMap]);

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
                flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300
                ${showEnglish 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-primary text-primary-foreground'}
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
          <p className="text-muted-foreground">
            Click on highlighted words to see their meanings
          </p>
        </motion.div>

        {/* Word Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            <span className="text-sm text-muted-foreground">Easy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="text-sm text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="text-sm text-muted-foreground">Hard</span>
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
            className="glass rounded-2xl p-6 md:p-8 border border-border/50"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                showEnglish 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-primary/20 text-primary'
              }`}>
                {showEnglish ? 'English Version' : 'বাংলা সংস্করণ'}
              </span>
            </div>
            
            <div className={`text-lg leading-relaxed ${
              showEnglish ? '' : 'font-bengali'
            }`} style={{ 
              fontFamily: showEnglish ? 'inherit' : "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
              lineHeight: '2'
            }}>
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
          className="mt-8"
        >
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Words in this Passage ({passage.words.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {passage.words.map((word, i) => {
              const wordData = passageWordMap.get(word.toUpperCase());
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => wordData && setSelectedWord(wordData)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${wordData 
                      ? wordData.difficulty === 'easy'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : wordData.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-muted text-muted-foreground'
                    }
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

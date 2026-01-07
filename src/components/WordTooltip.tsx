import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, ArrowRight, Copy, Check, Star, CheckCircle, Volume2 } from 'lucide-react';
import { Word } from '@/lib/wordParser';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface WordTooltipProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkLearned?: (wordId: string, word: string) => void;
  onToggleFavorite?: (wordId: string, word: string) => void;
  isLearned?: boolean;
  isFavorite?: boolean;
  showActions?: boolean;
}

export default function WordTooltip({ 
  word, 
  isOpen, 
  onClose, 
  onMarkLearned, 
  onToggleFavorite,
  isLearned = false,
  isFavorite = false,
  showActions = false
}: WordTooltipProps) {
  const [copied, setCopied] = useState(false);

  if (!word) return null;

  const copyWord = () => {
    navigator.clipboard.writeText(word.word);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const difficultyStyles = {
    easy: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
    medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    hard: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[90vw] max-w-xl max-h-[85vh] overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border shadow-lg flex flex-col h-full">
              {/* Header */}
              <div className="relative p-5 sm:p-6 border-b border-border flex-shrink-0">
                <button 
                  onClick={onClose} 
                  className="absolute right-4 top-4 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-4 pr-10">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-serif font-semibold text-primary">{word.word[0].toUpperCase()}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display text-2xl font-semibold text-foreground">{word.word}</h2>
                      <button 
                        onClick={speak} 
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        aria-label="Pronounce word"
                      >
                        <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                      <button 
                        onClick={copyWord} 
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        aria-label="Copy word"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    
                    {word.pronunciation && (
                      <p className="text-muted-foreground text-sm font-mono mb-2">/{word.pronunciation}/</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md capitalize">
                        {word.partOfSpeech}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md border capitalize ${difficultyStyles[word.difficulty]}`}>
                        {word.difficulty}
                      </span>
                      {isLearned && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Learned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    {onMarkLearned && !isLearned && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onMarkLearned(word.id, word.word)} 
                        className="flex-1 gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Learned
                      </Button>
                    )}
                    {onToggleFavorite && (
                      <Button 
                        size="sm" 
                        variant={isFavorite ? "secondary" : "outline"}
                        onClick={() => onToggleFavorite(word.id, word.word)} 
                        className="flex-1 gap-1.5"
                      >
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        {isFavorite ? 'Favorited' : 'Favorite'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                {/* Bangla Meaning */}
                {word.banglaMeaning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.05 }} 
                    className="p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <h3 className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">বাংলা অর্থ</h3>
                    <p className="text-foreground leading-relaxed font-bengali">{word.banglaMeaning}</p>
                  </motion.div>
                )}

                {/* English Meaning */}
                {word.smartMeaning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }} 
                    className="p-4 rounded-lg bg-secondary/50 border border-border"
                  >
                    <h3 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">English Meaning</h3>
                    <p className="text-foreground leading-relaxed">{word.smartMeaning}</p>
                  </motion.div>
                )}

                {/* Synonyms */}
                {word.synonyms?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h3 className="text-sm font-semibold text-foreground">Synonyms</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.slice(0, 10).map((syn, i) => (
                        <span key={i} className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-500/20">
                          {syn}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Antonyms */}
                {word.antonyms?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <h3 className="text-sm font-semibold text-foreground">Antonyms</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {word.antonyms.slice(0, 8).map((ant, i) => (
                        <span key={i} className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-md border border-red-200 dark:border-red-500/20">
                          {ant}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Examples */}
                {word.examples?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Examples</h3>
                    </div>
                    <div className="space-y-2">
                      {word.examples.slice(0, 3).map((example, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
                          <p className="text-sm text-foreground/90 italic">"{example}"</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {!word.banglaMeaning && !word.smartMeaning && (
                  <div className="text-center py-8 text-muted-foreground">
                    Word data not available.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

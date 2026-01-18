import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Copy, Check, Star, CheckCircle, BookOpen, Sparkles, ArrowLeftRight, Quote, Bookmark } from 'lucide-react';
import { Word } from '@/lib/wordParser';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface WordDetailPanelProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkLearned?: (wordId: string, word: string) => void;
  onToggleFavorite?: (wordId: string, word: string) => void;
  isLearned?: boolean;
  isFavorite?: boolean;
  showActions?: boolean;
}

export default function WordDetailPanel({ 
  word, 
  isOpen, 
  onClose, 
  onMarkLearned, 
  onToggleFavorite,
  isLearned = false,
  isFavorite = false,
  showActions = false
}: WordDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!word) return null;

  const copyWord = () => {
    navigator.clipboard.writeText(word.word);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speak = (accent: 'US' | 'UK' = 'US') => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = accent === 'US' ? 'en-US' : 'en-GB';
    speechSynthesis.speak(utterance);
  };

  const difficultyConfig = {
    easy: { 
      label: 'Beginner',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    medium: { 
      label: 'Intermediate',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800'
    },
    hard: { 
      label: 'Advanced',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800'
    },
  };

  const difficulty = difficultyConfig[word.difficulty];

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:bg-black/20"
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <motion.aside
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <header className="relative px-6 pt-6 pb-5 border-b border-border bg-card/50">
              <button 
                onClick={onClose} 
                className="absolute right-4 top-4 p-2.5 rounded-full hover:bg-muted transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Word Title Section */}
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-serif font-bold text-primary">
                    {word.word[0].toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="font-serif text-3xl font-semibold text-foreground tracking-tight mb-1.5">
                    {word.word}
                  </h2>
                  
                  {word.pronunciation && (
                    <p className="text-muted-foreground text-base font-mono tracking-wide">
                      /{word.pronunciation}/
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Tags & Actions */}
              <div className="flex items-center justify-between mt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground rounded-full capitalize tracking-wide">
                    {word.partOfSpeech}
                  </span>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
                    {difficulty.label}
                  </span>
                  {isLearned && (
                    <span className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mastered
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => speak('US')}
                    className="p-2 rounded-full hover:bg-muted transition-colors group"
                    title="US Pronunciation"
                  >
                    <Volume2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                  <button 
                    onClick={copyWord}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    title="Copy word"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {showActions && (
                <div className="flex gap-2 mt-5">
                  {onMarkLearned && !isLearned && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onMarkLearned(word.id, word.word)} 
                      className="flex-1 gap-2 h-10 rounded-full"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Learned
                    </Button>
                  )}
                  {onToggleFavorite && (
                    <Button 
                      size="sm" 
                      variant={isFavorite ? "secondary" : "outline"}
                      onClick={() => onToggleFavorite(word.id, word.word)} 
                      className="flex-1 gap-2 h-10 rounded-full"
                    >
                      <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Saved' : 'Save Word'}
                    </Button>
                  )}
                </div>
              )}
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Bangla Meaning */}
                {word.banglaMeaning && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.05 }}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-base font-bengali font-semibold text-primary">ব</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        বাংলা অর্থ
                      </h3>
                    </div>
                    <div className="pl-10">
                      <p className="text-foreground text-lg leading-relaxed font-bengali">
                        {word.banglaMeaning}
                      </p>
                    </div>
                  </motion.section>
                )}

                {/* English Meaning */}
                {word.smartMeaning && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        Definition
                      </h3>
                    </div>
                    <div className="pl-10">
                      <p className="text-foreground text-base leading-relaxed">
                        {word.smartMeaning}
                      </p>
                    </div>
                  </motion.section>
                )}

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Synonyms */}
                {word.synonyms?.length > 0 && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        Synonyms
                      </h3>
                    </div>
                    <div className="pl-10 flex flex-wrap gap-2">
                      {word.synonyms.slice(0, 10).map((syn, i) => (
                        <span 
                          key={i} 
                          className="px-3.5 py-2 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-default"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Antonyms */}
                {word.antonyms?.length > 0 && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                        <ArrowLeftRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        Antonyms
                      </h3>
                    </div>
                    <div className="pl-10 flex flex-wrap gap-2">
                      {word.antonyms.slice(0, 8).map((ant, i) => (
                        <span 
                          key={i} 
                          className="px-3.5 py-2 text-sm font-medium bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-lg border border-rose-200/50 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-default"
                        >
                          {ant}
                        </span>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Examples */}
                {word.examples?.length > 0 && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                        <Quote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        Usage Examples
                      </h3>
                    </div>
                    <div className="pl-10 space-y-3">
                      {word.examples.slice(0, 3).map((example, i) => (
                        <div 
                          key={i} 
                          className="relative pl-4 py-3 rounded-lg bg-muted/30 border-l-[3px] border-primary/60"
                        >
                          <p className="text-sm text-foreground/90 italic leading-relaxed">
                            "{example}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {!word.banglaMeaning && !word.smartMeaning && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Word details not available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-border bg-card/50">
              <p className="text-xs text-muted-foreground text-center">
                Click anywhere outside to close • Press <kbd className="px-1.5 py-0.5 mx-1 text-[10px] bg-muted rounded">ESC</kbd> to dismiss
              </p>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

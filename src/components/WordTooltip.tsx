import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, BookOpen, ArrowRight } from 'lucide-react';
import { Word } from '@/lib/wordParser';
import { Button } from '@/components/ui/button';

interface WordTooltipProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function WordTooltip({ word, isOpen, onClose, position }: WordTooltipProps) {
  if (!word) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Tooltip Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md"
          >
            <div className="glass-strong rounded-2xl p-6 shadow-elevated border border-primary/20">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold gradient-text">{word.word}</h3>
                  {word.pronunciation && (
                    <p className="text-muted-foreground text-sm mt-1">
                      /{word.pronunciation}/
                    </p>
                  )}
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                    {word.partOfSpeech}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-destructive/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Meanings */}
              <div className="space-y-4">
                {/* English Meaning */}
                <div className="p-3 rounded-xl bg-secondary/50">
                  <p className="text-sm font-medium text-accent mb-1">English Meaning</p>
                  <p className="text-foreground">{word.smartMeaning || 'No definition available'}</p>
                </div>

                {/* Bangla Meaning */}
                {word.banglaMeaning && (
                  <div className="p-3 rounded-xl bg-primary/10">
                    <p className="text-sm font-medium text-primary mb-1">বাংলা অর্থ</p>
                    <p className="text-foreground text-lg">{word.banglaMeaning}</p>
                  </div>
                )}

                {/* Synonyms */}
                {word.synonyms && word.synonyms.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Synonyms</p>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.slice(0, 6).map((syn, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-md"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                {word.examples && word.examples.length > 0 && (
                  <div className="p-3 rounded-xl bg-muted/50 border-l-2 border-accent">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Example</p>
                    <p className="text-foreground italic text-sm">{word.examples[0]}</p>
                  </div>
                )}
              </div>

              {/* Difficulty Badge */}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  word.difficulty === 'easy' 
                    ? 'bg-green-500/20 text-green-400'
                    : word.difficulty === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {word.difficulty}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

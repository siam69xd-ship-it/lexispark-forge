import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, BookOpen, Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { Word } from '@/lib/wordParser';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface WordTooltipProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WordTooltip({ word, isOpen, onClose }: WordTooltipProps) {
  const [copied, setCopied] = useState(false);

  if (!word) return null;

  const copyWord = () => {
    navigator.clipboard.writeText(word.word);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-lg max-h-[85vh] overflow-hidden"
          >
            <div className="glass-strong rounded-3xl border border-primary/30 shadow-elevated overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-6 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 rounded-full hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>

                {/* Word title */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {word.word[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-foreground">{word.word}</h2>
                      <button onClick={copyWord} className="p-1 hover:bg-muted rounded-md transition-colors">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    {word.pronunciation && (
                      <p className="text-muted-foreground text-sm mt-0.5">
                        /{word.pronunciation}/
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                        {word.partOfSpeech}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4 space-y-5 max-h-[50vh] overflow-y-auto">
                {/* Bangla Meaning - Primary */}
                {word.banglaMeaning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇧🇩</span>
                      <h3 className="text-sm font-semibold text-primary">বাংলা অর্থ</h3>
                    </div>
                    <p className="text-foreground text-lg leading-relaxed" style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" }}>
                      {word.banglaMeaning}
                    </p>
                  </motion.div>
                )}

                {/* English Meaning */}
                {word.smartMeaning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇬🇧</span>
                      <h3 className="text-sm font-semibold text-accent">English Meaning</h3>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {word.smartMeaning}
                    </p>
                  </motion.div>
                )}

                {/* Synonyms */}
                {word.synonyms && word.synonyms.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <h3 className="text-sm font-semibold text-foreground">Synonyms</h3>
                      <span className="text-xs text-muted-foreground">({word.synonyms.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.slice(0, 12).map((syn, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.03 }}
                          className="px-3 py-1.5 text-sm bg-green-500/10 text-green-400 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-default"
                        >
                          {syn}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Antonyms */}
                {word.antonyms && word.antonyms.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight className="w-4 h-4 text-red-400" />
                      <h3 className="text-sm font-semibold text-foreground">Antonyms</h3>
                      <span className="text-xs text-muted-foreground">({word.antonyms.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {word.antonyms.slice(0, 8).map((ant, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 + i * 0.03 }}
                          className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-default"
                        >
                          {ant}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Examples */}
                {word.examples && word.examples.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-semibold text-foreground">Examples</h3>
                    </div>
                    <div className="space-y-2">
                      {word.examples.slice(0, 3).map((example, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="p-3 rounded-xl bg-blue-500/5 border-l-3 border-blue-400/50"
                        >
                          <p className="text-sm text-foreground/90 italic leading-relaxed">
                            "{example}"
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* No data message */}
                {!word.banglaMeaning && !word.smartMeaning && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Word data not available in the database.</p>
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

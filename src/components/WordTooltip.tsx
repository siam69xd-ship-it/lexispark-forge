import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, BookOpen, Sparkles, ArrowRight, Copy, Check, GripHorizontal } from 'lucide-react';
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
  const [position, setPosition] = useState({ x: 0, y: 0 });

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Modal - Draggable */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 350,
              mass: 0.5,
            }}
            drag
            dragMomentum={false}
            dragElastic={0.08}
            onDragEnd={(event, info) => {
              setPosition({ x: info.offset.x, y: info.offset.y });
            }}
            style={{ x: position.x, y: position.y }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-2xl max-h-[90vh] cursor-grab active:cursor-grabbing will-change-transform"
          >
            <div className="glass-strong rounded-2xl sm:rounded-3xl border border-primary/30 shadow-elevated overflow-hidden flex flex-col h-full transition-shadow duration-300 will-change-auto">
              {/* Header with gradient - Draggable area */}
              <div className="relative bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 select-none transition-colors duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                
                {/* Drag Handle & Close button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-muted-foreground opacity-60">
                    <GripHorizontal className="w-4 h-4" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full hover:bg-destructive/20 hover:text-destructive h-8 w-8"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Word title */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-primary-foreground">
                      {word.word[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">{word.word}</h2>
                      <button onClick={copyWord} className="p-1 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    {word.pronunciation && (
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1 break-words">
                        /{word.pronunciation}/
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                        {word.partOfSpeech}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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

              {/* Content - Scrollable */}
              <div className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                {/* Bangla Meaning - Primary */}
                {word.banglaMeaning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-primary">🇧🇩 বাংলা অর্থ</h3>
                    </div>
                    <p className="text-foreground text-sm sm:text-base leading-relaxed" style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" }}>
                      {word.banglaMeaning}
                    </p>
                  </motion.div>
                )}

                {/* English Meaning */}
                {word.smartMeaning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.4, ease: "easeOut" }}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-accent">🇬🇧 English Meaning</h3>
                    </div>
                    <p className="text-foreground text-sm sm:text-base leading-relaxed">
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
                    <div className="flex items-center gap-2 mb-2.5">
                      <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Synonyms</h3>
                      <span className="text-xs text-muted-foreground">({word.synonyms.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {word.synonyms.slice(0, 12).map((syn, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.16 + i * 0.025, duration: 0.35, ease: "easeOut" }}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-green-500/10 text-green-400 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors duration-200 cursor-default"
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
                    <div className="flex items-center gap-2 mb-2.5">
                      <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Antonyms</h3>
                      <span className="text-xs text-muted-foreground">({word.antonyms.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {word.antonyms.slice(0, 8).map((ant, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.20 + i * 0.025, duration: 0.35, ease: "easeOut" }}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors duration-200 cursor-default"
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
                    <div className="flex items-center gap-2 mb-2.5">
                      <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Examples</h3>
                    </div>
                    <div className="space-y-2">
                      {word.examples.slice(0, 3).map((example, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12, y: 8 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ delay: 0.24 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                          className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/5 border-l-3 border-blue-400/50 transition-all duration-200"
                        >
                          <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
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

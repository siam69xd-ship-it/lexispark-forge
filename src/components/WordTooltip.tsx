import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, ArrowRight, Copy, Check, GripHorizontal, Star, CheckCircle } from 'lucide-react';
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.5 }}
            drag
            dragMomentum={false}
            dragElastic={0.08}
            onDragEnd={(event, info) => setPosition({ x: info.offset.x, y: info.offset.y })}
            style={{ x: position.x, y: position.y }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-2xl max-h-[90vh] cursor-grab active:cursor-grabbing"
          >
            <div className="glass-strong rounded-2xl sm:rounded-3xl border border-primary/30 shadow-elevated overflow-hidden flex flex-col h-full">
              <div className="relative bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 select-none">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                
                <div className="flex items-center justify-between mb-3">
                  <GripHorizontal className="w-4 h-4 text-muted-foreground opacity-60" />
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/20 hover:text-destructive h-8 w-8">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-primary-foreground">{word.word[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">{word.word}</h2>
                      <button onClick={copyWord} className="p-1 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    {word.pronunciation && <p className="text-muted-foreground text-xs sm:text-sm mt-1">/{word.pronunciation}/</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">{word.partOfSpeech}</span>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${word.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : word.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{word.difficulty}</span>
                      {isLearned && <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Learned</span>}
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-2 mt-4">
                    {onMarkLearned && !isLearned && (
                      <Button size="sm" onClick={() => onMarkLearned(word.id, word.word)} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30">
                        <CheckCircle className="w-4 h-4 mr-1" />Mark Learned
                      </Button>
                    )}
                    {onToggleFavorite && (
                      <Button size="sm" onClick={() => onToggleFavorite(word.id, word.word)} className={`flex-1 ${isFavorite ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/40' : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                        <Star className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-yellow-400' : ''}`} />{isFavorite ? 'Favorited' : 'Favorite'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                {word.banglaMeaning && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20">
                    <h3 className="text-xs sm:text-sm font-semibold text-primary mb-2">🇧🇩 বাংলা অর্থ</h3>
                    <p className="text-foreground text-sm sm:text-base leading-relaxed" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>{word.banglaMeaning}</p>
                  </motion.div>
                )}

                {word.smartMeaning && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/20">
                    <h3 className="text-xs sm:text-sm font-semibold text-accent mb-2">🇬🇧 English Meaning</h3>
                    <p className="text-foreground text-sm sm:text-base leading-relaxed">{word.smartMeaning}</p>
                  </motion.div>
                )}

                {word.synonyms?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Synonyms ({word.synonyms.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {word.synonyms.slice(0, 12).map((syn, i) => (
                        <span key={i} className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">{syn}</span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {word.antonyms?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <ArrowRight className="w-4 h-4 text-red-400" />
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Antonyms ({word.antonyms.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {word.antonyms.slice(0, 8).map((ant, i) => (
                        <span key={i} className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">{ant}</span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {word.examples?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">Examples</h3>
                    </div>
                    <div className="space-y-2">
                      {word.examples.slice(0, 3).map((example, i) => (
                        <div key={i} className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/5 border-l-3 border-blue-400/50">
                          <p className="text-xs sm:text-sm text-foreground/90 italic">"{example}"</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {!word.banglaMeaning && !word.smartMeaning && (
                  <div className="text-center py-6 text-muted-foreground">Word data not available.</div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
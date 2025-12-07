import { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Layers, Shuffle, Volume2, RotateCcw, CheckCircle, ChevronLeft, ChevronRight, Type } from 'lucide-react';
import { useWords } from '@/context/WordContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function FlashcardsPage() {
  const { words, memorized, markAsMemorized } = useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [direction, setDirection] = useState(0);
  const [useLetterFilter, setUseLetterFilter] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<Set<string>>(new Set());

  // Get available letters from words
  const availableLetters = useMemo(() => {
    const letters = new Set(words.map(w => w.firstLetter));
    return ALPHABET.filter(l => letters.has(l));
  }, [words]);

  // Get letter counts
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    words.forEach(w => {
      counts[w.firstLetter] = (counts[w.firstLetter] || 0) + 1;
    });
    return counts;
  }, [words]);

  const toggleLetter = (letter: string) => {
    setSelectedLetters(prev => {
      const updated = new Set(prev);
      if (updated.has(letter)) {
        updated.delete(letter);
      } else {
        updated.add(letter);
      }
      return updated;
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const selectAllLetters = () => {
    setSelectedLetters(new Set(availableLetters));
    setCurrentIndex(0);
  };

  const clearAllLetters = () => {
    setSelectedLetters(new Set());
    setCurrentIndex(0);
  };

  // All words are flashcards, optionally filtered by letter
  const flashcardWords = useMemo(() => {
    let filtered = [...words];
    
    if (useLetterFilter && selectedLetters.size > 0) {
      filtered = filtered.filter(w => selectedLetters.has(w.firstLetter));
    }
    
    if (shuffled) {
      return [...filtered].sort(() => Math.random() - 0.5);
    }
    return filtered;
  }, [words, shuffled, useLetterFilter, selectedLetters]);

  const currentWord = flashcardWords[currentIndex];

  const nextCard = () => {
    if (flashcardWords.length === 0) return;
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => (i + 1) % flashcardWords.length);
    }, 150);
  };

  const prevCard = () => {
    if (flashcardWords.length === 0) return;
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => (i - 1 + flashcardWords.length) % flashcardWords.length);
    }, 150);
  };

  const handleShuffle = () => {
    setShuffled(prev => !prev);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        prevCard();
      } else {
        nextCard();
      }
    }
  };

  const speak = () => {
    if (currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleMarkMemorized = () => {
    if (currentWord) {
      markAsMemorized(currentWord.id);
      if (currentIndex >= flashcardWords.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  // Empty State
  if (flashcardWords.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Flashcards</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              <span className="gradient-text">Flashcard Deck</span>
            </h1>
          </motion.div>

          {/* Letter Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-border/50 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                <Label className="text-sm">Filter by Letter</Label>
              </div>
              <Switch
                checked={useLetterFilter}
                onCheckedChange={setUseLetterFilter}
              />
            </div>
            
            {useLetterFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllLetters}
                    className="rounded-lg text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllLetters}
                    className="rounded-lg text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableLetters.map(letter => (
                    <button
                      key={letter}
                      onClick={() => toggleLetter(letter)}
                      className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${
                        selectedLetters.has(letter)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {letter}
                      <span className="block text-[10px] font-normal opacity-70">
                        {letterCounts[letter] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Layers className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-3">No Words Found</h2>
            <p className="text-muted-foreground mb-6">
              {useLetterFilter && selectedLetters.size > 0 
                ? 'No words found for selected letters. Try selecting different letters.'
                : 'Select some letters to start practicing flashcards.'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{flashcardWords.length} Cards</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            <span className="gradient-text">Flashcards</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Swipe or use arrows to navigate • Tap to flip
          </p>
        </motion.div>

        {/* Letter Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 border border-border/50 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              <Label className="text-sm">Filter by Letter</Label>
            </div>
            <Switch
              checked={useLetterFilter}
              onCheckedChange={(checked) => {
                setUseLetterFilter(checked);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
            />
          </div>
          
          {useLetterFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllLetters}
                  className="rounded-lg text-xs h-7"
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllLetters}
                  className="rounded-lg text-xs h-7"
                >
                  Clear
                </Button>
                {selectedLetters.size > 0 && (
                  <span className="text-xs text-muted-foreground self-center ml-1">
                    {selectedLetters.size} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableLetters.map(letter => (
                  <button
                    key={letter}
                    onClick={() => toggleLetter(letter)}
                    className={`w-8 h-8 rounded-md border text-xs font-bold transition-all ${
                      selectedLetters.has(letter)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/50 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-4 text-muted-foreground text-sm"
        >
          Card {currentIndex + 1} of {flashcardWords.length}
        </motion.div>

        {/* Flashcard */}
        <div className="relative h-[350px] md:h-[400px] perspective-1000 mb-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ x: direction * 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              onClick={() => setIsFlipped(!isFlipped)}
              className="absolute inset-0 cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 glass rounded-3xl border border-border/50 p-8 flex flex-col items-center justify-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); speak(); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-primary/10 text-primary"
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.button>
                  
                  <span className="text-sm text-muted-foreground mb-2">{currentWord?.partOfSpeech}</span>
                  <h2 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-4 text-center">
                    {currentWord?.word}
                  </h2>
                  {currentWord?.pronunciation && (
                    <span className="text-lg text-muted-foreground">
                      /{currentWord.pronunciation}/
                    </span>
                  )}
                  
                  <span className="absolute bottom-4 text-sm text-muted-foreground">
                    Tap to flip
                  </span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 glass rounded-3xl border border-border/50 p-6 md:p-8 overflow-y-auto backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="space-y-4">
                    {/* Bangla Meaning */}
                    {currentWord?.banglaMeaning && (
                      <div>
                        <h3 className="text-sm font-semibold text-accent mb-2">বাংলা অর্থ</h3>
                        <p className="text-foreground text-lg">{currentWord.banglaMeaning}</p>
                      </div>
                    )}

                    {/* Meaning */}
                    {currentWord?.smartMeaning && (
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-2">Definition</h3>
                        <p className="text-foreground">{currentWord.smartMeaning}</p>
                      </div>
                    )}

                    {/* Example */}
                    {currentWord?.examples[0] && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Example</h3>
                        <p className="text-foreground italic text-sm">"{currentWord.examples[0]}"</p>
                      </div>
                    )}

                    {/* Synonyms */}
                    {currentWord?.synonyms.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Synonyms</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {currentWord.synonyms.slice(0, 5).map((syn, i) => (
                            <span 
                              key={i}
                              className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400"
                            >
                              {syn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={prevCard}
            className="h-12 w-12 rounded-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex gap-2">
            {flashcardWords.slice(
              Math.max(0, currentIndex - 2),
              Math.min(flashcardWords.length, currentIndex + 3)
            ).map((_, i) => {
              const actualIndex = Math.max(0, currentIndex - 2) + i;
              return (
                <button
                  key={actualIndex}
                  onClick={() => { setIsFlipped(false); setCurrentIndex(actualIndex); }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    actualIndex === currentIndex 
                      ? 'bg-primary' 
                      : 'bg-muted hover:bg-muted-foreground'
                  }`}
                />
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextCard}
            className="h-12 w-12 rounded-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={handleShuffle}
            className={`rounded-xl gap-2 ${shuffled ? 'border-primary text-primary' : ''}`}
          >
            <Shuffle className="w-4 h-4" />
            {shuffled ? 'Shuffled' : 'Shuffle'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex(0);
            }}
            className="rounded-xl gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleMarkMemorized}
            className="rounded-xl gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Memorized
          </Button>
        </div>

        {/* Stats */}
        {memorized.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center p-4 rounded-xl glass border border-green-500/20"
          >
            <p className="text-green-400">
              🎉 You've memorized {memorized.size} words!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

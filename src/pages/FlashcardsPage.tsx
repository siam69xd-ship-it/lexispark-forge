import { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Layers, Shuffle, Volume2, RotateCcw, CheckCircle, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useWords } from '@/context/WordContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type ViewMode = 'selection' | 'flashcards';

export default function FlashcardsPage() {
  const { words, flashcards, addToFlashcards, removeFromFlashcards, markAsMemorized, memorized } = useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [direction, setDirection] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('selection');

  const flashcardWords = useMemo(() => {
    const cardWords = words.filter(w => flashcards.has(w.id));
    if (shuffled) {
      return [...cardWords].sort(() => Math.random() - 0.5);
    }
    return cardWords;
  }, [words, flashcards, shuffled]);

  const currentWord = flashcardWords[currentIndex];

  const addAllWords = () => {
    words.forEach(w => addToFlashcards(w.id));
    toast({ title: `Added all ${words.length} words to flashcards` });
  };

  const nextCard = () => {
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => (i + 1) % flashcardWords.length);
    }, 150);
  };

  const prevCard = () => {
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => (i - 1 + flashcardWords.length) % flashcardWords.length);
    }, 150);
  };

  const handleShuffle = () => {
    setShuffled(true);
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
      if (flashcardWords.length === 1) {
        setCurrentIndex(0);
      } else if (currentIndex >= flashcardWords.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  const handleRemove = () => {
    if (currentWord) {
      removeFromFlashcards(currentWord.id);
      if (flashcardWords.length === 1) {
        setCurrentIndex(0);
      } else if (currentIndex >= flashcardWords.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  // Selection Screen
  if (viewMode === 'selection') {
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
            <p className="text-muted-foreground max-w-xl mx-auto">
              Practice vocabulary with interactive flashcards
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-border/50 text-center"
            >
              <div className="text-4xl font-bold gradient-text mb-2">{words.length}</div>
              <p className="text-muted-foreground text-sm">Total Words</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-border/50 text-center"
            >
              <div className="text-4xl font-bold text-primary mb-2">{flashcards.size}</div>
              <p className="text-muted-foreground text-sm">In Deck</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-border/50 text-center"
            >
              <div className="text-4xl font-bold text-green-400 mb-2">{memorized.size}</div>
              <p className="text-muted-foreground text-sm">Memorized</p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* Add All Words */}
            <Button
              onClick={addAllWords}
              size="lg"
              variant="outline"
              className="w-full rounded-xl gap-2 h-14"
            >
              <Plus className="w-5 h-5" />
              Add All {words.length} Words to Flashcards
            </Button>

            {/* Start Flashcards */}
            {flashcards.size > 0 && (
              <Button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setViewMode('flashcards');
                }}
                size="lg"
                className="w-full rounded-xl gap-2 h-14 bg-gradient-button glow"
              >
                <Layers className="w-5 h-5" />
                Start Flashcards ({flashcards.size} cards)
              </Button>
            )}

            {/* Browse Words Link */}
            <Link to="/words" className="block">
              <Button
                variant="ghost"
                size="lg"
                className="w-full rounded-xl gap-2"
              >
                Or browse words to add individually
              </Button>
            </Link>
          </motion.div>

          {/* Recent Cards Preview */}
          {flashcards.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <h2 className="text-lg font-semibold mb-4">Cards in Deck</h2>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {flashcardWords.slice(0, 50).map(w => (
                  <span
                    key={w.id}
                    className="px-3 py-1.5 rounded-lg glass border border-border/50 text-sm"
                  >
                    {w.word}
                  </span>
                ))}
                {flashcards.size > 50 && (
                  <span className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm">
                    +{flashcards.size - 50} more
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Empty State (should not happen but just in case)
  if (flashcardWords.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Layers className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-3">No Flashcards Yet</h1>
          <p className="text-muted-foreground mb-6">
            Add words to your flashcard deck to start practicing.
          </p>
          <Button size="lg" className="rounded-xl" onClick={() => setViewMode('selection')}>
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  // Flashcard View
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setViewMode('selection')}
            className="mb-4"
          >
            ← Back to Selection
          </Button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{flashcardWords.length} Cards</span>
          </div>
          <h1 className="text-4xl font-bold font-display mb-2">
            <span className="gradient-text">Flashcards</span>
          </h1>
          <p className="text-muted-foreground">
            Swipe or use arrows to navigate • Tap to flip
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6 text-muted-foreground"
        >
          Card {currentIndex + 1} of {flashcardWords.length}
        </motion.div>

        {/* Flashcard */}
        <div className="relative h-[400px] md:h-[450px] perspective-1000 mb-8">
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
                  <h2 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-4">
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
                        <p className="text-foreground">{currentWord?.smartMeaning}</p>
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
        <div className="flex items-center justify-center gap-4 mb-8">
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
            className="rounded-xl gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFlipped(false)}
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
          <Button
            variant="ghost"
            onClick={handleRemove}
            className="rounded-xl gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        </div>

        {/* Stats */}
        {memorized.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center p-4 rounded-xl glass border border-green-500/20"
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

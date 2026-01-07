import { motion } from 'framer-motion';
import { Volume2, BookmarkPlus, BookmarkCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Word } from '@/lib/wordParser';
import { useWords } from '@/context/WordContext';
import { Button } from '@/components/ui/button';

interface WordCardProps {
  word: Word;
  index?: number;
}

export default function WordCard({ word, index = 0 }: WordCardProps) {
  const { flashcards, addToFlashcards, removeFromFlashcards } = useWords();
  const isInFlashcards = flashcards.has(word.id);

  const speak = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const toggleFlashcard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInFlashcards) {
      removeFromFlashcards(word.id);
    } else {
      addToFlashcards(word.id);
    }
  };

  const difficultyStyles = {
    easy: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
    medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    hard: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link to={`/word/${word.id}`} className="block h-full">
        <div className="h-full p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-md flex flex-col group cursor-pointer">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {word.word}
                </h3>
              </div>
              {word.pronunciation && (
                <p className="text-sm text-muted-foreground font-mono">
                  /{word.pronunciation}/
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={speak}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 transition-all ${
                  isInFlashcards 
                    ? 'text-primary opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                }`}
                onClick={toggleFlashcard}
              >
                {isInFlashcards ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </Button>
              <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-1" />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md capitalize">
              {word.partOfSpeech}
            </span>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-md border capitalize ${difficultyStyles[word.difficulty]}`}>
              {word.difficulty}
            </span>
          </div>

          {/* Meaning */}
          <p className="text-sm text-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
            {word.smartMeaning}
          </p>

          {/* Bangla */}
          {word.banglaMeaning && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-3 font-bengali">
              {word.banglaMeaning}
            </p>
          )}

          {/* Synonyms */}
          {word.synonyms?.length > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="flex flex-wrap gap-1.5">
                {word.synonyms.slice(0, 3).map((syn, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded"
                  >
                    {syn}
                  </span>
                ))}
                {word.synonyms.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-muted-foreground">
                    +{word.synonyms.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

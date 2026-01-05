import { motion } from 'framer-motion';
import { Volume2, BookmarkPlus, BookmarkCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Word } from '@/lib/wordParser';
import { useWords } from '@/context/WordContext';
import { Badge } from '@/components/ui/badge';
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

  const difficultyColor = {
    easy: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    hard: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Link to={`/word/${word.id}`}>
        <div className="group p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer hover-lift">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {word.word}
              </h3>
              {word.pronunciation && (
                <span className="text-sm text-muted-foreground">
                  /{word.pronunciation}/
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
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
            </div>
          </div>

          {/* Part of Speech & Difficulty */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs font-normal">
              {word.partOfSpeech}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs font-normal ${difficultyColor[word.difficulty]}`}
            >
              {word.difficulty}
            </Badge>
          </div>

          {/* Meaning */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {word.smartMeaning}
          </p>

          {/* Synonyms Preview */}
          {word.synonyms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {word.synonyms.slice(0, 3).map((syn, i) => (
                <span 
                  key={i}
                  className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                >
                  {syn}
                </span>
              ))}
              {word.synonyms.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  +{word.synonyms.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
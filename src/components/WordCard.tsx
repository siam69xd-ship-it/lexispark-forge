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

  const difficultyConfig = {
    easy: { 
      label: 'Beginner',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500'
    },
    medium: { 
      label: 'Intermediate',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500'
    },
    hard: { 
      label: 'Advanced',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500'
    },
  };

  const difficulty = difficultyConfig[word.difficulty];

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Link to={`/word/${word.id}`} className="block h-full">
        <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col group cursor-pointer relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          
          {/* Header */}
          <div className="flex items-start justify-between mb-4 relative">
            <div className="flex items-start gap-4">
              {/* Initial Letter */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-serif font-bold text-primary">
                  {word.word[0].toUpperCase()}
                </span>
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {word.word}
                </h3>
                {word.pronunciation && (
                  <p className="text-sm text-muted-foreground font-mono mt-0.5">
                    /{word.pronunciation}/
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                onClick={speak}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 transition-all rounded-full ${
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

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground rounded-full capitalize">
              {word.partOfSpeech}
            </span>
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} />
              {difficulty.label}
            </span>
          </div>

          {/* Meaning */}
          <p className="text-sm text-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
            {word.smartMeaning}
          </p>

          {/* Bangla */}
          {word.banglaMeaning && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-4 font-bengali">
              {word.banglaMeaning}
            </p>
          )}

          {/* Footer - Synonyms */}
          {word.synonyms?.length > 0 && (
            <div className="pt-4 border-t border-border mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {word.synonyms.slice(0, 3).map((syn, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg"
                    >
                      {syn}
                    </span>
                  ))}
                  {word.synonyms.length > 3 && (
                    <span className="px-2.5 py-1 text-xs text-muted-foreground">
                      +{word.synonyms.length - 3}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

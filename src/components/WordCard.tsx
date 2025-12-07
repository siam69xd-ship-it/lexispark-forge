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
    easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/word/${word.id}`}>
        <motion.div
          className="group relative p-5 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Gradient Hover Effect */}
          <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
                  {word.word}
                </h3>
                {word.pronunciation && (
                  <span className="text-sm text-muted-foreground">
                    /{word.pronunciation}/
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={speak}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-lg transition-all ${
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
              <Badge variant="secondary" className="text-xs">
                {word.partOfSpeech}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${difficultyColor[word.difficulty]}`}
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
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {syn}
                  </span>
                ))}
                {word.synonyms.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    +{word.synonyms.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Arrow */}
            <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

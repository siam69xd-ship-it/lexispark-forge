import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Volume2, BookmarkPlus, BookmarkCheck, ArrowLeft, 
  Copy, Check, ChevronRight 
} from 'lucide-react';
import { useState } from 'react';
import { useWords } from '@/context/WordContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function WordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWordById, flashcards, addToFlashcards, removeFromFlashcards, words } = useWords();
  const [copied, setCopied] = useState(false);

  const word = id ? getWordById(id) : null;
  const isInFlashcards = word ? flashcards.has(word.id) : false;

  if (!word) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Word not found</h1>
          <Link to="/words">
            <Button>Back to Words</Button>
          </Link>
        </div>
      </div>
    );
  }

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const toggleFlashcard = () => {
    if (isInFlashcards) {
      removeFromFlashcards(word.id);
      toast({ title: 'Removed from flashcards' });
    } else {
      addToFlashcards(word.id);
      toast({ title: 'Added to flashcards' });
    }
  };

  const copyWord = async () => {
    await navigator.clipboard.writeText(word.word);
    setCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Get related words (same first letter, excluding current)
  const relatedWords = words
    .filter(w => w.firstLetter === word.firstLetter && w.id !== word.id)
    .slice(0, 4);

  const difficultyColor = {
    easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="rounded-xl gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 md:p-8 border border-border/50 mb-6"
        >
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold font-display gradient-text">
                  {word.word}
                </h1>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={speak}
                  className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Volume2 className="w-6 h-6" />
                </motion.button>
              </div>
              {word.pronunciation && (
                <p className="text-lg text-muted-foreground">
                  /{word.pronunciation}/
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyWord}
                className="rounded-xl gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant={isInFlashcards ? 'default' : 'outline'}
                size="sm"
                onClick={toggleFlashcard}
                className="rounded-xl gap-2"
              >
                {isInFlashcards ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    In Flashcards
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    Add to Flashcards
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Badge variant="secondary" className="text-sm">
              {word.partOfSpeech}
            </Badge>
            <Badge variant="outline" className={`text-sm ${difficultyColor[word.difficulty]}`}>
              {word.difficulty}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {word.firstLetter} section
            </Badge>
          </div>

          {/* Smart Meaning */}
          {word.smartMeaning && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                Definition
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                {word.smartMeaning}
              </p>
            </div>
          )}

          {/* Bangla Meaning */}
          {word.banglaMeaning && (
            <div className="mb-8 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-accent rounded-full" />
                বাংলা অর্থ
              </h2>
              <p className="text-foreground leading-relaxed text-lg">
                {word.banglaMeaning}
              </p>
              {word.detailedBanglaMeaning && (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {word.detailedBanglaMeaning}
                </p>
              )}
            </div>
          )}

          {/* Synonyms & Antonyms */}
          {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {word.synonyms.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-green-500 rounded-full" />
                    Synonyms
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {word.synonyms.map((syn, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm border border-green-500/20"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-red-500 rounded-full" />
                    Antonyms
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((ant, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20"
                      >
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Examples */}
          {word.examples.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                Examples
              </h2>
              <div className="space-y-3">
                {word.examples.map((example, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 p-4 rounded-xl bg-muted/20 border border-border/30"
                  >
                    <span className="text-primary font-bold">{i + 1}.</span>
                    <p className="text-foreground leading-relaxed">{example}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Related Words */}
        {relatedWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">Related Words</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedWords.map(related => (
                <Link key={related.id} to={`/word/${related.id}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-xl glass border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{related.word}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        {related.partOfSpeech}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

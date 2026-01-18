import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Volume2, BookmarkPlus, BookmarkCheck, ArrowLeft, 
  Copy, Check, ChevronRight, BookOpen, Sparkles, 
  ArrowLeftRight, Quote, GraduationCap 
} from 'lucide-react';
import { useState } from 'react';
import { useWords } from '@/context/WordContext';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen pt-20 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-serif font-semibold mb-4 text-foreground">Word not found</h1>
          <Link to="/words">
            <Button className="rounded-full">Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const speak = (accent: 'US' | 'UK' = 'US') => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = accent === 'US' ? 'en-US' : 'en-GB';
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
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="rounded-full gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Button>
        </motion.div>

        {/* Main Card */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden mb-8"
        >
          {/* Header Section */}
          <header className="p-6 sm:p-8 md:p-10 border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-start gap-5">
                {/* Initial Letter Badge */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-primary">
                    {word.word[0].toUpperCase()}
                  </span>
                </div>
                
                <div className="min-w-0 flex-1 pt-1">
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-2">
                    {word.word}
                  </h1>
                  {word.pronunciation && (
                    <p className="text-muted-foreground text-lg font-mono tracking-wide">
                      /{word.pronunciation}/
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speak('US')}
                  className="rounded-full gap-2 h-10"
                  title="US Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs">US</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speak('UK')}
                  className="rounded-full gap-2 h-10"
                  title="UK Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs">UK</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyWord}
                  className="rounded-full gap-2 h-10"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant={isInFlashcards ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={toggleFlashcard}
                  className="rounded-full gap-2 h-10"
                >
                  {isInFlashcards ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isInFlashcards ? 'Saved' : 'Save'}</span>
                </Button>
              </div>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-4 py-2 text-sm font-semibold bg-secondary text-secondary-foreground rounded-full capitalize tracking-wide">
                {word.partOfSpeech}
              </span>
              <span className={`px-4 py-2 text-sm font-semibold rounded-full border flex items-center gap-2 ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
                <span className={`w-2 h-2 rounded-full ${difficulty.dot}`} />
                {difficulty.label}
              </span>
              <span className="px-4 py-2 text-sm font-medium bg-muted text-muted-foreground rounded-full">
                {word.firstLetter} Section
              </span>
            </div>
          </header>

          {/* Content Section */}
          <div className="p-6 sm:p-8 md:p-10 space-y-8">
            {/* Definition */}
            {word.smartMeaning && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Definition
                  </h2>
                </div>
                <div className="pl-[52px]">
                  <p className="text-lg sm:text-xl text-foreground leading-relaxed">
                    {word.smartMeaning}
                  </p>
                </div>
              </motion.section>
            )}

            {/* Bangla Meaning */}
            {word.banglaMeaning && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-6 rounded-2xl bg-primary/5 border border-primary/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bengali font-semibold text-primary">ব</span>
                  </div>
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    বাংলা অর্থ
                  </h2>
                </div>
                <div className="pl-[52px]">
                  <p className="text-lg text-foreground leading-relaxed font-bengali">
                    {word.banglaMeaning}
                  </p>
                  {word.detailedBanglaMeaning && (
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed font-bengali">
                      {word.detailedBanglaMeaning}
                    </p>
                  )}
                </div>
              </motion.section>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Synonyms & Antonyms Grid */}
            {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Synonyms */}
                {word.synonyms.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        Synonyms
                      </h2>
                    </div>
                    <div className="pl-[52px] flex flex-wrap gap-2">
                      {word.synonyms.map((syn, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.02 }}
                          className="px-4 py-2 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-default"
                        >
                          {syn}
                        </motion.span>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Antonyms */}
                {word.antonyms.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                        <ArrowLeftRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        Antonyms
                      </h2>
                    </div>
                    <div className="pl-[52px] flex flex-wrap gap-2">
                      {word.antonyms.map((ant, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 + i * 0.02 }}
                          className="px-4 py-2 text-sm font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl border border-rose-200/50 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-default"
                        >
                          {ant}
                        </motion.span>
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            )}

            {/* Examples */}
            {word.examples.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
                    <Quote className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Usage Examples
                  </h2>
                </div>
                <div className="pl-[52px] space-y-3">
                  {word.examples.map((example, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="relative pl-5 py-4 pr-5 rounded-xl bg-muted/30 border-l-[3px] border-primary/60"
                    >
                      <span className="absolute left-5 top-4 text-primary/40 font-semibold text-sm">
                        {i + 1}.
                      </span>
                      <p className="text-foreground leading-relaxed pl-6 italic">
                        "{example}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </motion.article>

        {/* Related Words */}
        {relatedWords.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Related Words
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedWords.map((related, i) => (
                <Link key={related.id} to={`/word/${related.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-serif font-semibold text-primary">
                          {related.word[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {related.word}
                        </span>
                        <span className="text-muted-foreground text-sm ml-2 capitalize">
                          {related.partOfSpeech}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

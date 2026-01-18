import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, BookOpen, ChevronDown, Library, GraduationCap, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useWords } from '@/context/WordContext';
import WordCard from '@/components/WordCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'preposition'];
const DIFFICULTIES = [
  { value: 'easy', label: 'Beginner', color: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'medium', label: 'Intermediate', color: 'text-amber-600 dark:text-amber-400' },
  { value: 'hard', label: 'Advanced', color: 'text-rose-600 dark:text-rose-400' },
];
const ITEMS_PER_PAGE = 24;

export default function WordsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { words, loading } = useWords();
  
  const [selectedLetter, setSelectedLetter] = useState<string | null>(
    searchParams.get('letter') || null
  );
  const [selectedPos, setSelectedPos] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const filteredWords = useMemo(() => {
    let result = [...words];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.word.toLowerCase().includes(q) ||
        w.smartMeaning.toLowerCase().includes(q) ||
        w.synonyms.some(s => s.toLowerCase().includes(q))
      );
    }

    if (selectedLetter) {
      result = result.filter(w => w.firstLetter === selectedLetter);
    }

    if (selectedPos.length > 0) {
      result = result.filter(w => selectedPos.includes(w.partOfSpeech));
    }

    if (selectedDifficulty.length > 0) {
      result = result.filter(w => selectedDifficulty.includes(w.difficulty));
    }

    return result;
  }, [words, searchQuery, selectedLetter, selectedPos, selectedDifficulty]);

  const displayedWords = filteredWords.slice(0, displayCount);
  const hasMore = displayCount < filteredWords.length;

  const clearFilters = () => {
    setSelectedLetter(null);
    setSelectedPos([]);
    setSelectedDifficulty([]);
    setSearchQuery('');
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const hasActiveFilters = selectedLetter || selectedPos.length > 0 || selectedDifficulty.length > 0 || searchQuery;

  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    words.forEach(w => {
      counts[w.firstLetter] = (counts[w.firstLetter] || 0) + 1;
    });
    return counts;
  }, [words]);

  const difficultyStats = useMemo(() => {
    return {
      easy: words.filter(w => w.difficulty === 'easy').length,
      medium: words.filter(w => w.difficulty === 'medium').length,
      hard: words.filter(w => w.difficulty === 'hard').length,
    };
  }, [words]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Academic Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14 pt-8"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/20 mb-6">
            <Library className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide">
              {words.length.toLocaleString()} Words in Collection
            </span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-5 tracking-tight">
            Word Library
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
            Explore our comprehensive vocabulary collection with detailed meanings, contextual examples, and translations.
          </p>
        </motion.header>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-12 max-w-3xl mx-auto"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-foreground">{difficultyStats.easy}</p>
            <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">Beginner</p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-foreground">{difficultyStats.medium}</p>
            <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-medium">Intermediate</p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-foreground">{difficultyStats.hard}</p>
            <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">Advanced</p>
          </div>
          <div className="hidden md:block p-4 sm:p-5 rounded-2xl bg-card border border-border text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-2">
              <Library className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-foreground">{words.length}</p>
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Total Words</p>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 space-y-6"
        >
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(ITEMS_PER_PAGE);
                }}
                placeholder="Search words, meanings, synonyms..."
                className="w-full h-14 sm:h-16 pl-14 pr-14 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-base sm:text-lg shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full gap-2 h-11 px-5 font-medium">
                  <Filter className="w-4 h-4" />
                  Part of Speech
                  {selectedPos.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs rounded-full">{selectedPos.length}</Badge>
                  )}
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-xl">
                {PARTS_OF_SPEECH.map(pos => (
                  <DropdownMenuCheckboxItem
                    key={pos}
                    checked={selectedPos.includes(pos)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPos([...selectedPos, pos]);
                      } else {
                        setSelectedPos(selectedPos.filter(p => p !== pos));
                      }
                      setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className="capitalize"
                  >
                    {pos}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full gap-2 h-11 px-5 font-medium">
                  <GraduationCap className="w-4 h-4" />
                  Difficulty
                  {selectedDifficulty.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs rounded-full">{selectedDifficulty.length}</Badge>
                  )}
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44 rounded-xl">
                {DIFFICULTIES.map(diff => (
                  <DropdownMenuCheckboxItem
                    key={diff.value}
                    checked={selectedDifficulty.includes(diff.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDifficulty([...selectedDifficulty, diff.value]);
                      } else {
                        setSelectedDifficulty(selectedDifficulty.filter(d => d !== diff.value));
                      }
                      setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className={diff.color}
                  >
                    {diff.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="rounded-full text-muted-foreground hover:text-foreground gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Alphabet Filter - Academic Style */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-2 max-w-4xl mx-auto">
            {ALPHABET.map(letter => {
              const count = letterCounts[letter] || 0;
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(isSelected ? null : letter);
                    setDisplayCount(ITEMS_PER_PAGE);
                  }}
                  disabled={count === 0}
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-serif font-semibold transition-all duration-200
                    ${isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : count > 0
                      ? 'bg-card border border-border text-foreground hover:border-primary hover:text-primary hover:shadow-md'
                      : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                    }
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Active Filters Display */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {selectedLetter && (
                  <Badge variant="secondary" className="gap-1.5 py-1.5 px-4 text-sm font-medium rounded-full">
                    Letter: {selectedLetter}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                      onClick={() => setSelectedLetter(null)}
                    />
                  </Badge>
                )}
                {selectedPos.map(pos => (
                  <Badge key={pos} variant="secondary" className="gap-1.5 py-1.5 px-4 text-sm font-medium capitalize rounded-full">
                    {pos}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                      onClick={() => setSelectedPos(selectedPos.filter(p => p !== pos))}
                    />
                  </Badge>
                ))}
                {selectedDifficulty.map(diff => {
                  const diffConfig = DIFFICULTIES.find(d => d.value === diff);
                  return (
                    <Badge key={diff} variant="secondary" className={`gap-1.5 py-1.5 px-4 text-sm font-medium rounded-full ${diffConfig?.color}`}>
                      {diffConfig?.label}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                        onClick={() => setSelectedDifficulty(selectedDifficulty.filter(d => d !== diff))}
                      />
                    </Badge>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground text-sm tracking-wide">
            Showing <span className="font-semibold text-foreground">{displayedWords.length}</span> of <span className="font-semibold text-foreground">{filteredWords.length}</span> words
          </p>
        </motion.div>

        {/* Words Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : displayedWords.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedWords.map((word, index) => (
                <WordCard key={word.id} word={word} index={index % ITEMS_PER_PAGE} />
              ))}
            </div>

            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-14"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
                  className="rounded-full px-10 h-14 font-medium text-base"
                >
                  Load More Words
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">No Words Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Try adjusting your filters or search term to find what you're looking for
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-full px-8">
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

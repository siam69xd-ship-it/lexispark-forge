import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, BookOpen, ChevronDown, Library, GraduationCap } from 'lucide-react';
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
const DIFFICULTIES = ['easy', 'medium', 'hard'];
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

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Academic Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 pt-8"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border bg-card mb-6">
            <Library className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground tracking-wide">
              {words.length.toLocaleString()} Words in Collection
            </span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4 tracking-tight">
            Word Library
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            Explore our comprehensive vocabulary collection with detailed meanings, contextual examples, and translations.
          </p>
        </motion.header>

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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(ITEMS_PER_PAGE);
                }}
                placeholder="Search words, meanings, synonyms..."
                className="w-full h-14 pl-12 pr-12 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors"
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
                <Button variant="outline" className="rounded-lg gap-2 h-10 px-4 font-medium">
                  <Filter className="w-4 h-4" />
                  Part of Speech
                  {selectedPos.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{selectedPos.length}</Badge>
                  )}
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
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
                <Button variant="outline" className="rounded-lg gap-2 h-10 px-4 font-medium">
                  <GraduationCap className="w-4 h-4" />
                  Difficulty
                  {selectedDifficulty.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{selectedDifficulty.length}</Badge>
                  )}
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {DIFFICULTIES.map(diff => (
                  <DropdownMenuCheckboxItem
                    key={diff}
                    checked={selectedDifficulty.includes(diff)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDifficulty([...selectedDifficulty, diff]);
                      } else {
                        setSelectedDifficulty(selectedDifficulty.filter(d => d !== diff));
                      }
                      setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className="capitalize"
                  >
                    {diff}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="rounded-lg text-muted-foreground hover:text-foreground gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Alphabet Filter - Academic Style */}
          <div className="flex flex-wrap justify-center gap-1 pt-2 max-w-4xl mx-auto">
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
                    w-9 h-9 rounded-lg text-sm font-serif font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : count > 0
                      ? 'bg-card border border-border text-foreground hover:border-primary hover:text-primary'
                      : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
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
                  <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-sm font-medium">
                    Letter: {selectedLetter}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                      onClick={() => setSelectedLetter(null)}
                    />
                  </Badge>
                )}
                {selectedPos.map(pos => (
                  <Badge key={pos} variant="secondary" className="gap-1.5 py-1 px-3 text-sm font-medium capitalize">
                    {pos}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                      onClick={() => setSelectedPos(selectedPos.filter(p => p !== pos))}
                    />
                  </Badge>
                ))}
                {selectedDifficulty.map(diff => (
                  <Badge key={diff} variant="secondary" className="gap-1.5 py-1 px-3 text-sm font-medium capitalize">
                    {diff}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                      onClick={() => setSelectedDifficulty(selectedDifficulty.filter(d => d !== diff))}
                    />
                  </Badge>
                ))}
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
            Showing <span className="font-medium text-foreground">{displayedWords.length}</span> of <span className="font-medium text-foreground">{filteredWords.length}</span> words
          </p>
        </motion.div>

        {/* Words Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-muted/40 animate-pulse" />
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
                className="flex justify-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
                  className="rounded-lg px-8 h-12 font-medium"
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
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Words Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search term
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-lg">
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

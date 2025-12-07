import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, BookOpen, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useWords } from '@/context/WordContext';
import WordCard from '@/components/WordCard';
import SearchBar from '@/components/SearchBar';
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

  // Get letter counts
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    words.forEach(w => {
      counts[w.firstLetter] = (counts[w.firstLetter] || 0) + 1;
    });
    return counts;
  }, [words]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{words.length.toLocaleString()} Words Available</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Word <span className="gradient-text">Library</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our comprehensive vocabulary collection with detailed meanings, examples, and translations.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
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
                className="w-full h-12 pl-12 pr-12 rounded-xl glass border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Part of Speech Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                  <Filter className="w-4 h-4" />
                  Part of Speech
                  {selectedPos.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{selectedPos.length}</Badge>
                  )}
                  <ChevronDown className="w-4 h-4" />
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
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Difficulty Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                  Difficulty
                  {selectedDifficulty.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{selectedDifficulty.length}</Badge>
                  )}
                  <ChevronDown className="w-4 h-4" />
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
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="rounded-xl text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Alphabet Filter */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-2">
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
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : count > 0
                      ? 'bg-muted/50 hover:bg-muted text-foreground'
                      : 'bg-muted/20 text-muted-foreground/50 cursor-not-allowed'
                  }`}
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
                  <Badge variant="secondary" className="gap-1">
                    Letter: {selectedLetter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSelectedLetter(null)}
                    />
                  </Badge>
                )}
                {selectedPos.map(pos => (
                  <Badge key={pos} variant="secondary" className="gap-1">
                    {pos}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSelectedPos(selectedPos.filter(p => p !== pos))}
                    />
                  </Badge>
                ))}
                {selectedDifficulty.map(diff => (
                  <Badge key={diff} variant="secondary" className="gap-1">
                    {diff}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSelectedDifficulty(selectedDifficulty.filter(d => d !== diff))}
                    />
                  </Badge>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6 text-muted-foreground"
        >
          Showing {displayedWords.length} of {filteredWords.length} words
        </motion.div>

        {/* Words Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : displayedWords.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedWords.map((word, index) => (
                <WordCard key={word.id} word={word} index={index % ITEMS_PER_PAGE} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-8"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
                  className="rounded-xl"
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
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Words Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search term
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-xl">
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

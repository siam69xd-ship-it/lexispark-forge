import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWords } from '@/context/WordContext';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  size?: 'default' | 'large';
  className?: string;
}

export default function SearchBar({ size = 'default', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { searchWords } = useWords();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const results = query.length > 1 ? searchWords(query).slice(0, 6) : [];

  const handleSelect = (wordId: string) => {
    navigate(`/word/${wordId}`);
    setQuery('');
    setFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0].id);
    } else if (query.trim()) {
      navigate(`/words?search=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !focused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focused]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${
            size === 'large' ? 'w-6 h-6' : 'w-5 h-5'
          }`} />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search words, meanings, synonyms..."
            className={`w-full pl-12 pr-12 glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all ${
              size === 'large' 
                ? 'h-16 text-lg rounded-2xl' 
                : 'h-12 rounded-xl'
            }`}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl border border-border overflow-hidden shadow-elevated z-50"
          >
            {results.map((word, index) => (
              <motion.button
                key={word.id}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(word.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left group"
              >
                <div>
                  <span className="font-semibold text-foreground">{word.word}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    {word.smartMeaning.slice(0, 50)}...
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, Grid, List } from 'lucide-react';
import { parsePassages, Passage } from '@/lib/passageParser';
import PassageCard from '@/components/PassageCard';
import PassageView from '@/components/PassageView';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ReadAndLearnPage() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function loadPassages() {
      try {
        const response = await fetch('/data/passages.txt');
        const text = await response.text();
        const parsed = parsePassages(text);
        setPassages(parsed);
      } catch (error) {
        console.error('Failed to load passages:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPassages();
  }, []);

  const filteredPassages = passages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.words.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedPassage) {
    return (
      <PassageView
        passage={selectedPassage}
        onBack={() => setSelectedPassage(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Read & Learn</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Learn Words</span>
              <span className="text-foreground"> in Context</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Read engaging passages and learn vocabulary naturally. Click on highlighted words to see their meanings, synonyms, and examples.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search passages or words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border/50 rounded-xl"
                />
              </div>
              <div className="flex gap-1 p-1 bg-card rounded-xl border border-border/50">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-lg"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-lg"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center gap-8 mb-10"
          >
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{passages.length}</p>
              <p className="text-sm text-muted-foreground">Passages</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">
                {passages.reduce((acc, p) => acc + p.words.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Words to Learn</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Passages Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : filteredPassages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No passages found</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }>
            {filteredPassages.map((passage, index) => (
              <PassageCard
                key={passage.id}
                passage={passage}
                onClick={() => setSelectedPassage(passage)}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

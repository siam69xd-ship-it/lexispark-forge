import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Grid, List, FileText, GraduationCap } from 'lucide-react';
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

  const totalWords = passages.reduce((acc, p) => acc + p.words.length, 0);

  if (selectedPassage) {
    return (
      <PassageView
        passage={selectedPassage}
        onBack={() => setSelectedPassage(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border bg-card mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground tracking-wide">
                Contextual Learning
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4 tracking-tight">
              Read & Learn
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Master vocabulary through engaging passages. Click on highlighted words to explore their meanings, usage, and context.
            </p>
          </motion.header>

          {/* Search and View Toggle */}
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
                  placeholder="Search passages or vocabulary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl text-base"
                />
              </div>
              <div className="flex gap-1 p-1.5 bg-card rounded-xl border border-border">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-lg h-10 w-10"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-lg h-10 w-10"
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
            className="flex justify-center gap-12 mb-12"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-primary" />
                <p className="text-3xl font-semibold text-foreground">{passages.length}</p>
              </div>
              <p className="text-sm text-muted-foreground tracking-wide">Passages</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-primary" />
                <p className="text-3xl font-semibold text-foreground">{totalWords}</p>
              </div>
              <p className="text-sm text-muted-foreground tracking-wide">Vocabulary Words</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Passages Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : filteredPassages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Passages Found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </motion.div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-4 max-w-3xl mx-auto'
          }>
            {filteredPassages.map((passage, index) => (
              <PassageCard
                key={passage.id}
                passage={passage}
                onClick={() => setSelectedPassage(passage)}
                index={index}
                isListView={viewMode === 'list'}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

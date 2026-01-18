import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Grid, List, FileText, GraduationCap, Sparkles, BookMarked } from 'lucide-react';
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
    <div className="min-h-screen bg-background pt-20 pb-20">
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/20 mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide">
                Contextual Learning
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-5 tracking-tight">
              Read & Learn
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              Master vocabulary through carefully curated passages. 
              Click on highlighted words to explore their meanings, usage, and context.
            </p>
          </motion.header>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto"
          >
            <div className="p-5 rounded-2xl bg-card border border-border text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{passages.length}</p>
              <p className="text-sm text-muted-foreground">Passages</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{totalWords}</p>
              <p className="text-sm text-muted-foreground">Vocabulary</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <BookMarked className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-semibold text-foreground">2</p>
              <p className="text-sm text-muted-foreground">Languages</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-semibold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Levels</p>
            </div>
          </motion.div>

          {/* Search and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search passages or vocabulary words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-2xl text-base shadow-sm"
                />
              </div>
              <div className="flex gap-1.5 p-1.5 bg-card rounded-2xl border border-border shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-xl h-11 w-11"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-xl h-11 w-11"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Passages Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full mb-4"
            />
            <p className="text-muted-foreground">Loading passages...</p>
          </div>
        ) : filteredPassages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No Passages Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try searching with different keywords or browse all passages
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => setSearchQuery('')}
            >
              View All Passages
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredPassages.length}</span> passages
              </p>
            </motion.div>
            
            {/* Passages Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
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
          </>
        )}
      </section>
    </div>
  );
}

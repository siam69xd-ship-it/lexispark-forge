import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, GraduationCap, FileText, 
  Lightbulb, Target, BookMarked, ChevronRight,
  LayoutGrid, List, Filter, SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import GrammarChapterCard from '@/components/GrammarChapterCard';
import GrammarChapterView from '@/components/GrammarChapterView';
import { parseGrammarContent, GrammarChapter } from '@/lib/grammarParser';

export default function GrammarPage() {
  const [chapters, setChapters] = useState<GrammarChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<GrammarChapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadGrammarContent();
  }, []);

  const loadGrammarContent = async () => {
    try {
      const response = await fetch('/data/essential_grammar.txt');
      const content = await response.text();
      const parsed = parseGrammarContent(content);
      setChapters(parsed);
    } catch (error) {
      console.error('Error loading grammar content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNextChapter = () => {
    if (!selectedChapter) return;
    const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
    if (currentIndex < chapters.length - 1) {
      setSelectedChapter(chapters[currentIndex + 1]);
    }
  };

  const handlePreviousChapter = () => {
    if (!selectedChapter) return;
    const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
    if (currentIndex > 0) {
      setSelectedChapter(chapters[currentIndex - 1]);
    }
  };

  const totalSections = chapters.reduce((acc, ch) => acc + ch.sections.length, 0);
  const totalChapters = chapters.length;

  if (selectedChapter) {
    const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
    return (
      <GrammarChapterView
        chapter={selectedChapter}
        onBack={() => setSelectedChapter(null)}
        onNext={handleNextChapter}
        onPrevious={handlePreviousChapter}
        hasNext={currentIndex < chapters.length - 1}
        hasPrevious={currentIndex > 0}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Essential Grammar</span>
            </motion.div>
            
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Master English Grammar
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Comprehensive chapter-wise grammar lessons designed for Bengali speakers. 
              Learn rules, practice with examples, and build confidence in English writing.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">{chapters.length}</div>
                  <div className="text-xs text-muted-foreground">Chapters</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">{totalSections}</div>
                  <div className="text-xs text-muted-foreground">Sections</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">100+</div>
                  <div className="text-xs text-muted-foreground">Examples</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">BCS</div>
                  <div className="text-xs text-muted-foreground">Exam Ready</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 border-y border-border bg-card/50 backdrop-blur-sm sticky top-14 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chapters by topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background border-border"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                className="h-11 w-11"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                className="h-11 w-11"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading grammar chapters...</p>
              </div>
            </div>
          ) : filteredChapters.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                No Chapters Found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search query
              </p>
            </motion.div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredChapters.map((chapter, index) => (
                viewMode === 'grid' ? (
                  <GrammarChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    onClick={() => setSelectedChapter(chapter)}
                  />
                ) : (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedChapter(chapter)}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-serif font-bold text-primary">{chapter.id}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {chapter.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span>{chapter.sections.length} sections</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Learning Path CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <GraduationCap className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              Your Grammar Learning Journey
            </h2>
            <p className="text-muted-foreground mb-6">
              Start from Chapter 1 and progressively build your English grammar skills. 
              Each chapter builds upon the previous one for comprehensive learning.
            </p>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => chapters[0] && setSelectedChapter(chapters[0])}
            >
              Start Chapter 1
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Lightbulb, CheckCircle2, 
  ChevronDown, ChevronUp, GraduationCap, FileText,
  Bookmark, Share2, Copy, Check, BookMarked, Zap
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GrammarChapter } from '@/lib/grammarParser';
import { formatGrammarContent, extractBilingualPairs } from '@/lib/grammarParser';

interface GrammarChapterViewProps {
  chapter: GrammarChapter;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function GrammarChapterView({ 
  chapter, 
  onBack,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: GrammarChapterViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(chapter.sections.slice(0, 3).map(s => s.id))
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllContent, setShowAllContent] = useState(false);

  const bilingualPairs = useMemo(() => 
    extractBilingualPairs(chapter.rawContent), 
    [chapter.rawContent]
  );

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(chapter.sections.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'rule': return <FileText className="w-4 h-4" />;
      case 'shortcut': return <Zap className="w-4 h-4" />;
      case 'example': return <Lightbulb className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'rule': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'shortcut': return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'example': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20"
    >
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Chapters</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} className="text-xs">
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs">
                Collapse All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Chapter Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
              <span className="text-2xl font-serif font-bold text-primary">{chapter.id}</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
            {chapter.title}
          </h1>
          <p className="font-bengali text-xl text-primary/80 mb-4">
            {chapter.titleBengali}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {chapter.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">{chapter.sections.length}</strong> Sections</span>
            </div>
            {bilingualPairs.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span><strong className="text-foreground">{bilingualPairs.length}</strong> Examples</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sections */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Chapter Content</h2>
          </div>
          
          <div className="space-y-3">
            {chapter.sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.03 }}
                className={`
                  border rounded-xl overflow-hidden transition-all duration-300
                  ${expandedSections.has(section.id) 
                    ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/5' 
                    : 'border-border bg-card hover:border-primary/20'
                  }
                `}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center border
                      ${getSectionColor(section.type)}
                    `}>
                      {getSectionIcon(section.type)}
                    </div>
                    <div>
                      <span className={`
                        font-medium transition-colors block
                        ${expandedSections.has(section.id) ? 'text-primary' : 'text-foreground'}
                      `}>
                        {section.title}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {section.type}
                      </span>
                    </div>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSections.has(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-primary/10">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="text-muted-foreground leading-relaxed font-bengali whitespace-pre-wrap text-base">
                            {formatGrammarContent(section.content)}
                          </div>
                        </div>
                        
                        {section.englishContent && (
                          <div className="mt-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Examples</span>
                            </div>
                            <p className="text-foreground leading-relaxed">
                              {section.englishContent}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Raw Content Toggle */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <Button
            variant="outline"
            onClick={() => setShowAllContent(!showAllContent)}
            className="w-full gap-2"
          >
            <BookMarked className="w-4 h-4" />
            {showAllContent ? 'Hide Full Chapter Text' : 'Show Full Chapter Text'}
          </Button>
          
          <AnimatePresence>
            {showAllContent && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <ScrollArea className="h-[500px] rounded-xl border border-border bg-card p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="font-bengali text-base leading-loose whitespace-pre-wrap">
                      {formatGrammarContent(chapter.rawContent)}
                    </div>
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Bilingual Examples */}
        {bilingualPairs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Bengali-English Examples
              </h2>
            </div>
            
            <div className="space-y-3">
              {bilingualPairs.slice(0, 20).map((pair, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.02 }}
                  className="group p-4 rounded-xl border border-border bg-card hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          বাংলা
                        </span>
                      </div>
                      <p className="font-bengali text-foreground">
                        {pair.bengali}
                      </p>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          English
                        </span>
                      </div>
                      <p className="text-muted-foreground italic">
                        {pair.english}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => copyToClipboard(`${pair.bengali}\n${pair.english}`, `pair-${index}`)}
                    >
                      {copiedId === `pair-${index}` ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between pt-8 border-t border-border"
        >
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Chapter {chapter.id}
          </span>
          
          <Button
            onClick={onNext}
            disabled={!hasNext}
            className="gap-2"
          >
            Next
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        </motion.div>

        {/* Completion Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center"
        >
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
            Chapter {chapter.id} Complete!
          </h3>
          <p className="text-sm text-muted-foreground">
            Continue to the next chapter to master more grammar concepts.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

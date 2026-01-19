import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Lightbulb, CheckCircle2, 
  ChevronDown, ChevronUp, GraduationCap, FileText,
  Bookmark, Share2, Volume2, Copy, Check
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { GrammarChapter } from '@/lib/grammarParser';

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
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set([chapter.rules[0]?.id]));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleRule = (id: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="w-4 h-4" />
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
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-xl font-serif font-bold text-primary">{chapter.id}</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {chapter.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {chapter.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">{chapter.rules.length}</strong> Grammar Rules</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span><strong className="text-foreground">{chapter.examples.length}</strong> Examples</span>
            </div>
          </div>
        </motion.div>

        {/* Rules Section */}
        {chapter.rules.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl font-semibold text-foreground">Grammar Rules</h2>
            </div>
            
            <div className="space-y-3">
              {chapter.rules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={`
                    border rounded-xl overflow-hidden transition-all duration-300
                    ${expandedRules.has(rule.id) 
                      ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-border bg-card hover:border-primary/20'
                    }
                  `}
                >
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold
                        ${expandedRules.has(rule.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {index + 1}
                      </div>
                      <span className={`
                        font-medium transition-colors
                        ${expandedRules.has(rule.id) ? 'text-primary' : 'text-foreground'}
                      `}>
                        {rule.title}
                      </span>
                    </div>
                    {expandedRules.has(rule.id) ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedRules.has(rule.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-primary/10">
                          <p className="text-muted-foreground leading-relaxed font-bengali whitespace-pre-wrap">
                            {rule.content}
                          </p>
                          
                          {rule.examples.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                <span>Examples</span>
                              </div>
                              {rule.examples.map((example, i) => (
                                <div
                                  key={i}
                                  className="pl-6 py-2 border-l-2 border-amber-500/30 bg-amber-500/5 rounded-r-lg"
                                >
                                  <p className="text-sm text-foreground font-bengali">{example}</p>
                                </div>
                              ))}
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
        )}

        {/* Translation Examples */}
        {chapter.examples.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h2 className="font-serif text-xl font-semibold text-foreground">Practice Examples</h2>
            </div>
            
            <div className="space-y-4">
              {chapter.examples.slice(0, 10).map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Bengali
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(example.english, `example-${index}`)}
                    >
                      {copiedId === `example-${index}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="font-bengali text-foreground mb-4 text-lg leading-relaxed">
                    {example.bengali}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      English
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed italic">
                    {example.english}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-8 border-t border-border"
        >
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Chapter
          </Button>
          
          <Button
            onClick={onNext}
            disabled={!hasNext}
            className="gap-2"
          >
            Next Chapter
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        </motion.div>

        {/* Completion Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
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

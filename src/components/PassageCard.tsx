import { motion } from 'framer-motion';
import { ArrowRight, BookMarked, Sparkles } from 'lucide-react';
import { Passage } from '@/lib/passageParser';

interface PassageCardProps {
  passage: Passage;
  onClick: () => void;
  index: number;
  isListView?: boolean;
}

export default function PassageCard({ passage, onClick, index, isListView = false }: PassageCardProps) {
  if (isListView) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={onClick}
        className="group cursor-pointer"
      >
        <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <div className="flex items-start gap-5">
            {/* Passage Number */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-serif font-bold text-primary">{passage.id}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {passage.title}
                </h3>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
              
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed font-bengali">
                {passage.banglaText.slice(0, 150)}...
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BookMarked className="w-4 h-4" />
                  <span>{passage.words.length} words</span>
                </div>
                <div className="flex gap-1.5">
                  {passage.words.slice(0, 3).map((word, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs bg-secondary/80 text-secondary-foreground rounded-md font-medium"
                    >
                      {word.toLowerCase()}
                    </span>
                  ))}
                  {passage.words.length > 3 && (
                    <span className="px-2.5 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                      +{passage.words.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="group cursor-pointer h-full"
    >
      <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-5 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <span className="text-lg font-serif font-bold text-primary">{passage.id}</span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {passage.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" />
                {passage.words.length} vocabulary words
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Preview Text */}
        <div className="flex-1 mb-5">
          <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed font-bengali">
            {passage.banglaText.slice(0, 180)}...
          </p>
        </div>

        {/* Word Tags */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Featured Words</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {passage.words.slice(0, 4).map((word, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-xs bg-secondary/80 text-secondary-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                {word.toLowerCase()}
              </span>
            ))}
            {passage.words.length > 4 && (
              <span className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg font-medium">
                +{passage.words.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

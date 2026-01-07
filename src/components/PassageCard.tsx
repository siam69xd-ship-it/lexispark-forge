import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, FileText } from 'lucide-react';
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
        <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-serif font-semibold text-primary">{passage.id}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-display font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                  {passage.title}
                </h3>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
              </div>
              
              <p className="text-muted-foreground text-sm line-clamp-1 mb-3 leading-relaxed">
                {passage.banglaText.slice(0, 120)}...
              </p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>{passage.words.length} vocabulary words</span>
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
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer h-full"
    >
      <div className="h-full p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-md flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-serif font-semibold text-primary">{passage.id}</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {passage.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {passage.words.length} vocabulary words
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Preview Text */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed flex-1 font-bengali">
          {passage.banglaText.slice(0, 150)}...
        </p>

        {/* Word Tags */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
          {passage.words.slice(0, 4).map((word, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground rounded-md font-medium"
            >
              {word.toLowerCase()}
            </span>
          ))}
          {passage.words.length > 4 && (
            <span className="px-2.5 py-1 text-xs bg-muted text-muted-foreground rounded-md">
              +{passage.words.length - 4} more
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

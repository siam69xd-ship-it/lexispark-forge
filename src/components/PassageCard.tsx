import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Passage } from '@/lib/passageParser';

interface PassageCardProps {
  passage: Passage;
  onClick: () => void;
  index: number;
}

export default function PassageCard({ passage, onClick, index }: PassageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="glass rounded-2xl p-5 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <span className="text-lg font-bold gradient-text">{passage.id}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {passage.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {passage.words.length} vocabulary words
              </p>
            </div>
          </div>
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ x: 4 }}
          >
            <ArrowRight className="w-5 h-5 text-primary" />
          </motion.div>
        </div>

        {/* Preview Text */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {passage.banglaText.slice(0, 100)}...
        </p>

        {/* Word Tags */}
        <div className="flex flex-wrap gap-1.5">
          {passage.words.slice(0, 4).map((word, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs bg-primary/10 text-primary/80 rounded-md font-medium"
            >
              {word.toLowerCase()}
            </span>
          ))}
          {passage.words.length > 4 && (
            <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-md">
              +{passage.words.length - 4} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

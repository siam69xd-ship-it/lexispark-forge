import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, GraduationCap, FileText, Lightbulb } from 'lucide-react';
import type { GrammarChapter } from '@/lib/grammarParser';

interface GrammarChapterCardProps {
  chapter: GrammarChapter;
  index: number;
  onClick: () => void;
}

export default function GrammarChapterCard({ chapter, index, onClick }: GrammarChapterCardProps) {
  const colors = [
    { bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/20', accent: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    { bg: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-500/20', accent: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
    { bg: 'from-purple-500/10 to-violet-500/10', border: 'border-purple-500/20', accent: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
    { bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20', accent: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    { bg: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-500/20', accent: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
  ];
  
  const colorSet = colors[index % colors.length];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className={`
        relative overflow-hidden rounded-xl border ${colorSet.border}
        bg-gradient-to-br ${colorSet.bg} backdrop-blur-sm
        p-6 transition-all duration-300
        hover:shadow-lg hover:shadow-primary/5
        dark:bg-card/50
      `}>
        {/* Chapter Number Badge */}
        <div className={`
          absolute -top-1 -right-1 w-16 h-16
          bg-gradient-to-br ${colorSet.bg} rounded-bl-3xl
          flex items-end justify-start pb-3 pl-3
        `}>
          <span className={`text-2xl font-serif font-bold ${colorSet.accent}`}>
            {chapter.id}
          </span>
        </div>
        
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-xl mb-4
          bg-gradient-to-br ${colorSet.bg} ${colorSet.border} border
          flex items-center justify-center
          group-hover:scale-110 transition-transform duration-300
        `}>
          <GraduationCap className={`w-6 h-6 ${colorSet.accent}`} />
        </div>
        
        {/* Title */}
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 pr-12 group-hover:text-primary transition-colors">
          {chapter.title}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {chapter.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {chapter.sections.length > 0 && (
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{chapter.sections.length} Sections</span>
            </div>
          )}
          {chapter.titleBengali && (
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="font-bengali">{chapter.titleBengali.slice(0, 15)}...</span>
            </div>
          )}
        </div>
        
        {/* Learn Button */}
        <div className={`
          flex items-center gap-2 text-sm font-medium ${colorSet.accent}
          opacity-0 group-hover:opacity-100 transition-all duration-300
          transform translate-x-0 group-hover:translate-x-1
        `}>
          <span>Start Learning</span>
          <ChevronRight className="w-4 h-4" />
        </div>
        
        {/* Decorative dots */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${colorSet.dot} opacity-40`} />
          <div className={`w-1.5 h-1.5 rounded-full ${colorSet.dot} opacity-60`} />
          <div className={`w-1.5 h-1.5 rounded-full ${colorSet.dot} opacity-80`} />
        </div>
      </div>
    </motion.div>
  );
}

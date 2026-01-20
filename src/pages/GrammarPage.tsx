import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, CheckCircle, Circle, Play, Award, 
  ChevronRight, Target, TrendingUp, Sparkles 
} from 'lucide-react';
import { useGrammar } from '@/context/GrammarContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function GrammarPage() {
  const { chapters, loading, error, getChapterProgress, getTotalProgress } = useGrammar();
  const totalProgress = getTotalProgress();

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading grammar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-background">
      <div className="container-wide">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Essential Grammar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Master English Grammar
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Learn grammar rules, practice with exercises, and get instant feedback. 
            A structured learning path designed for Bengali speakers.
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-academic p-6 mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Your Progress</h2>
                <p className="text-muted-foreground text-sm">
                  {totalProgress.completed} of {totalProgress.total} milestones completed
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-sm">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold text-primary">{totalProgress.percentage}%</span>
              </div>
              <Progress value={totalProgress.percentage} className="h-3" />
            </div>
          </div>
        </motion.div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Learning Path</h2>
          </div>
          
          <div className="space-y-4">
            {chapters.map((chapter, index) => {
              const chapterProgress = getChapterProgress(chapter.chapter);
              const isCompleted = chapterProgress?.lessonCompleted && chapterProgress?.practiceCompleted;
              const hasStarted = chapterProgress?.lessonCompleted || chapterProgress?.practiceCompleted;
              
              return (
                <motion.div
                  key={chapter.chapter}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link to={`/grammar/${chapter.chapter}`}>
                    <div className={`card-academic p-5 hover-lift cursor-pointer group transition-all ${
                      isCompleted ? 'border-green-500/30 bg-green-500/5' : ''
                    }`}>
                      <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                            : hasStarted 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : hasStarted ? (
                            <Play className="w-5 h-5" />
                          ) : (
                            <span className="text-lg font-semibold">{chapter.chapter}</span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                              Chapter {chapter.chapter}
                            </span>
                            {isCompleted && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                Completed
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {chapter.title}
                          </h3>
                          
                          {/* Progress indicators */}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className={`flex items-center gap-1.5 ${
                              chapterProgress?.lessonCompleted 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-muted-foreground'
                            }`}>
                              {chapterProgress?.lessonCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5" />
                              )}
                              <span>Lesson</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${
                              chapterProgress?.practiceCompleted 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-muted-foreground'
                            }`}>
                              {chapterProgress?.practiceCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5" />
                              )}
                              <span>Practice</span>
                              {chapterProgress?.practiceScore !== null && chapterProgress?.practiceScore !== undefined && (
                                <span className="text-xs ml-1">({chapterProgress.practiceScore}%)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Motivation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-academic p-6 bg-gradient-to-br from-primary/5 to-transparent"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Learning Tips</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>Complete each lesson before attempting the practice test</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>Review examples carefully - they show real-world usage</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>Practice regularly to reinforce grammar rules</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

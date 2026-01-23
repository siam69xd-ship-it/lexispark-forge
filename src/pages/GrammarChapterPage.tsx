import { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, CheckCircle, Play, Award,
  ChevronRight, ChevronLeft, Volume2, Lightbulb,
  FileText, Target, Sparkles, Brain, PenLine, Send,
  RotateCcw, MessageCircle, Loader2, GraduationCap,
  Zap, Languages, Quote, BookMarked
} from 'lucide-react';
import { useGrammar } from '@/context/GrammarContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AIFeedbackResponse } from '@/lib/grammarTypes';

type TabMode = 'learn' | 'practice';

interface TranslationExercise {
  id: number;
  bengali: string;
  english: string;
  hint?: string;
  type: 'sentence' | 'passage';
}

interface SubmittedAnswer {
  exercise: TranslationExercise;
  userAnswer: string;
  feedback: AIFeedbackResponse;
}

export default function GrammarChapterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getChapter, markLessonComplete, savePracticeScore, getChapterProgress, chapters } = useGrammar();
  
  const chapterId = parseInt(id || '1');
  const chapter = getChapter(chapterId);
  const progress = getChapterProgress(chapterId);
  
  const [activeTab, setActiveTab] = useState<TabMode>('learn');
  const [currentSection, setCurrentSection] = useState(0);
  
  // Practice translation state
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userTranslation, setUserTranslation] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<SubmittedAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate translation exercises from chapter content (including passages)
  const translationExercises = useMemo((): TranslationExercise[] => {
    if (!chapter) return [];
    
    const exercises: TranslationExercise[] = [];
    let idCounter = 1;
    
    // From practice passage - full passage translation
    if (chapter.practice?.bengali && chapter.practice?.english) {
      exercises.push({
        id: idCounter++,
        bengali: chapter.practice.bengali,
        english: chapter.practice.english,
        type: 'passage'
      });
    }
    
    // From practice exercises
    if (chapter.practice_exercises) {
      chapter.practice_exercises.forEach((ex) => {
        exercises.push({
          id: idCounter++,
          bengali: ex.bengali,
          english: ex.english,
          type: 'sentence'
        });
      });
    }
    
    // From projects with full passages
    if (chapter.projects) {
      chapter.projects.forEach((proj) => {
        if (proj.passage && proj.translation) {
          exercises.push({
            id: idCounter++,
            bengali: proj.passage,
            english: proj.translation,
            type: 'passage',
            hint: proj.title
          });
        } else if (proj.bengali && proj.english) {
          exercises.push({
            id: idCounter++,
            bengali: proj.bengali,
            english: proj.english,
            type: 'sentence'
          });
        }
        // From project sentences
        if (proj.sentences) {
          proj.sentences.forEach(s => {
            exercises.push({
              id: idCounter++,
              bengali: s.bengali,
              english: s.english,
              type: 'sentence'
            });
          });
        }
      });
    }
    
    // From content examples
    if (chapter.content) {
      chapter.content.forEach(section => {
        if (section.examples) {
          section.examples.forEach(ex => {
            if (ex.bengali && ex.english) {
              exercises.push({
                id: idCounter++,
                bengali: ex.bengali,
                english: ex.english,
                type: 'sentence'
              });
            }
          });
        }
      });
    }
    
    // From environment topic or corona example (full passages)
    if (chapter.environment_topic) {
      exercises.push({
        id: idCounter++,
        bengali: chapter.environment_topic.bengali,
        english: chapter.environment_topic.english,
        type: 'passage',
        hint: 'Environment topic - Focus on verb+ing usage'
      });
    }
    
    if (chapter.corona_pandemic_example) {
      exercises.push({
        id: idCounter++,
        bengali: chapter.corona_pandemic_example.bengali,
        english: chapter.corona_pandemic_example.english,
        type: 'passage',
        hint: 'Linking words practice'
      });
    }
    
    // Limit to reasonable number but include passages
    return exercises.slice(0, 8);
  }, [chapter]);

  // Get grammar focus for AI feedback
  const getGrammarFocus = useCallback(() => {
    if (!chapter) return '';
    const focuses: string[] = [];
    if (chapter.rules?.length) focuses.push('Subject-verb agreement rules');
    if (chapter.pronouns?.length) focuses.push('Relative pronouns usage');
    if (chapter.tenses?.length) focuses.push('Passive voice structures');
    if (chapter.connectors?.length) focuses.push('Linking words and connectors');
    if (chapter.common_uses?.length) focuses.push('Verb+ing usage patterns');
    return focuses.join(', ');
  }, [chapter]);

  // Real AI feedback using edge function
  const getAIFeedback = async (
    bengaliText: string,
    userTranslation: string,
    correctTranslation: string
  ): Promise<AIFeedbackResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('grammar-feedback', {
        body: {
          bengaliText,
          userTranslation,
          correctTranslation,
          chapterTitle: chapter?.title || 'Grammar',
          grammarFocus: getGrammarFocus()
        }
      });

      if (error) throw error;
      
      return data as AIFeedbackResponse;
    } catch (err) {
      console.error('AI feedback error:', err);
      // Return fallback feedback
      return generateFallbackFeedback(userTranslation, correctTranslation);
    }
  };

  // Fallback feedback generator
  const generateFallbackFeedback = (userAnswer: string, correctAnswer: string): AIFeedbackResponse => {
    const userWords = userAnswer.toLowerCase().trim().split(/\s+/);
    const correctWords = correctAnswer.toLowerCase().trim().split(/\s+/);
    
    const matchingWords = userWords.filter(w => correctWords.includes(w));
    const similarity = matchingWords.length / Math.max(correctWords.length, 1);
    const score = Math.round(similarity * 100);
    
    return {
      score,
      isCorrect: score >= 70,
      strengths: score >= 70 
        ? ['Good vocabulary usage', 'Captured main meaning']
        : ['Attempted translation'],
      improvements: score < 70 
        ? ['Review grammar rules', 'Check sentence structure']
        : [],
      correctedVersion: correctAnswer,
      grammarTips: ['Focus on subject-verb agreement', 'Use appropriate tense'],
      overallComment: score >= 70 
        ? 'Good effort! Keep practicing.'
        : 'Keep practicing! Review the chapter content.'
    };
  };

  const handleSubmitTranslation = async () => {
    if (!userTranslation.trim() || !translationExercises[currentExercise]) return;
    
    setIsAnalyzing(true);
    
    try {
      const exercise = translationExercises[currentExercise];
      const feedback = await getAIFeedback(
        exercise.bengali,
        userTranslation,
        exercise.english
      );
      
      setSubmittedAnswers(prev => [...prev, {
        exercise,
        userAnswer: userTranslation,
        feedback
      }]);
      
      setShowFeedback(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze your translation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextExercise = () => {
    if (currentExercise + 1 >= translationExercises.length) {
      // Calculate final score
      const totalScore = submittedAnswers.reduce((acc, ans) => acc + ans.feedback.score, 0);
      const avgScore = Math.round(totalScore / submittedAnswers.length);
      savePracticeScore(chapterId, avgScore);
      setPracticeComplete(true);
    } else {
      setCurrentExercise(c => c + 1);
      setUserTranslation('');
      setShowFeedback(false);
    }
  };

  const restartPractice = () => {
    setCurrentExercise(0);
    setUserTranslation('');
    setShowFeedback(false);
    setSubmittedAnswers([]);
    setPracticeComplete(false);
    setPracticeStarted(true);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  if (!chapter) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="card-academic p-8 text-center">
          <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Chapter not found</p>
          <Link to="/grammar">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Grammar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Build lesson sections with enhanced styling
  const lessonSections: { title: string; icon: React.ReactNode; content: React.ReactNode }[] = [];
  
  if (chapter.content) {
    chapter.content.forEach(section => {
      lessonSections.push({
        title: section.section || 'Introduction',
        icon: <BookOpen className="w-5 h-5" />,
        content: (
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed font-bengali text-lg">{section.text}</p>
            {section.examples && section.examples.length > 0 && (
              <div className="space-y-3 mt-4">
                {section.examples.map((ex, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                    {ex.bengali && <p className="font-bengali text-muted-foreground mb-2 text-base">{ex.bengali}</p>}
                    {ex.english && (
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-foreground">{ex.english}</p>
                        <button onClick={() => speak(ex.english || '')} className="p-1.5 hover:bg-primary/10 rounded-full transition-colors">
                          <Volume2 className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    )}
                    {ex.question && (
                      <p className="text-sm text-primary mt-2 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="font-medium">Q:</span> {ex.question}
                      </p>
                    )}
                    {ex.answer && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="font-medium">A:</span> {ex.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      });
    });
  }

  if (chapter.rules) {
    lessonSections.push({
      title: 'Grammar Rules',
      icon: <GraduationCap className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {chapter.rules.map((rule, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                  {rule.number || i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium font-bengali mb-3 text-foreground">{rule.description}</p>
                  {rule.examples && (
                    <div className="space-y-2">
                      {rule.examples.map((ex, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                          <span className="flex-1">{ex}</span>
                          <button onClick={() => speak(ex)} className="p-1 hover:bg-primary/10 rounded transition-colors">
                            <Volume2 className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  if (chapter.shortcut_tips) {
    lessonSections.push({
      title: 'Quick Tips',
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {chapter.shortcut_tips.map((tip, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium font-bengali mb-2 text-foreground">{tip.tip}</p>
                  {tip.examples && (
                    <div className="space-y-1">
                      {tip.examples.map((ex, j) => (
                        <p key={j} className="text-sm text-muted-foreground italic pl-2 border-l-2 border-amber-500/30">• {ex}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  if (chapter.pronouns) {
    lessonSections.push({
      title: 'Pronouns',
      icon: <Languages className="w-5 h-5" />,
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          {chapter.pronouns.map((p, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <h4 className="font-bold text-xl text-primary mb-2">{p.pronoun}</h4>
              <p className="text-sm text-muted-foreground font-bengali mb-3">{p.usage}</p>
              <div className="p-3 rounded-lg bg-muted/30 text-sm italic">{p.example}</div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  if (chapter.tenses) {
    lessonSections.push({
      title: 'Tense Structures',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {chapter.tenses.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <h4 className="font-semibold text-primary mb-2">{t.tense}</h4>
              <div className="inline-block px-3 py-1.5 text-sm font-mono bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 mb-3">
                {t.structure}
              </div>
              <div className="space-y-1">
                {t.examples.map((ex, j) => (
                  <p key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-primary" />
                    {ex}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  if (chapter.connectors) {
    lessonSections.push({
      title: 'Linking Words',
      icon: <Quote className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {chapter.connectors.map((c, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <h4 className="font-semibold mb-3 text-foreground">{c.category}</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {c.words.map((w, j) => (
                  <span key={j} className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-medium border border-primary/20">
                    {w}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {c.examples.map((ex, j) => (
                  <p key={j} className="text-sm text-muted-foreground italic pl-3 border-l-2 border-primary/30">• {ex}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  if (chapter.common_uses) {
    lessonSections.push({
      title: 'Common Uses',
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {chapter.common_uses.map((use, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <h4 className="font-semibold text-primary mb-2">{use.use}</h4>
              {use.description && <p className="text-sm text-muted-foreground font-bengali mb-2">{use.description}</p>}
              {use.rule && <p className="text-sm text-muted-foreground font-bengali mb-2">{use.rule}</p>}
              {use.verbs && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {use.verbs.map((v, j) => (
                    <span key={j} className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">{v}</span>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                {use.examples.map((ex, j) => (
                  <p key={j} className="text-sm text-muted-foreground">• {ex}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  // Chapter 7: Basic Formula and Steps
  if (chapter.basic_formula || chapter.steps) {
    lessonSections.push({
      title: 'Writing Formula',
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {chapter.basic_formula && (
            <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="font-semibold text-primary mb-3">Basic Formula:</h4>
              <p className="text-xl font-mono font-bold text-foreground">{chapter.basic_formula}</p>
            </div>
          )}
          {chapter.steps && chapter.steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Translation Steps:</h4>
              {chapter.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="font-bengali text-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    });
  }

  // Chapter 7: Projects (Real Life Writing Examples)
  if (chapter.projects && chapter.projects.length > 0) {
    lessonSections.push({
      title: 'Real Life Projects',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {chapter.projects.map((proj, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {proj.number}
                </span>
                <div>
                  {proj.title && <h4 className="font-semibold text-foreground">{proj.title}</h4>}
                  {proj.headline && <p className="text-sm text-primary font-medium">{proj.headline}</p>}
                </div>
              </div>

              {/* Bengali Text */}
              {(proj.bengali || proj.passage) && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 mb-3">
                  <p className="font-bengali text-muted-foreground leading-relaxed">
                    {proj.passage || proj.bengali}
                  </p>
                </div>
              )}

              {/* English Translation */}
              {(proj.english || proj.translation) && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">English Translation:</span>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {proj.translation || proj.english}
                  </p>
                </div>
              )}

              {/* Project Steps */}
              {proj.steps && proj.steps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h5 className="text-sm font-semibold text-muted-foreground mb-2">Analysis:</h5>
                  <div className="space-y-1">
                    {proj.steps.map((step, j) => (
                      <p key={j} className="text-sm text-muted-foreground pl-2 border-l-2 border-primary/30">
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sentences */}
              {proj.sentences && proj.sentences.length > 0 && (
                <div className="mt-4 space-y-3">
                  {proj.sentences.map((sentence, j) => (
                    <div key={j} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="font-bengali text-sm text-muted-foreground mb-1">{sentence.bengali}</p>
                      <p className="text-sm text-foreground">{sentence.english}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )
    });
  }

  // Chapter 8: Essential Grammar Parts
  if (chapter.parts && chapter.parts.length > 0) {
    chapter.parts.forEach((part, partIndex) => {
      lessonSections.push({
        title: part.part,
        icon: <GraduationCap className="w-5 h-5" />,
        content: (
          <div className="space-y-6">
            {part.topics.map((topic, topicIndex) => (
              <motion.div 
                key={topicIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: topicIndex * 0.05 }}
                className="p-5 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{topic.topic}</h4>
                    {topic.count && <p className="text-xs text-muted-foreground">{topic.count} items</p>}
                  </div>
                </div>

                {/* Common Rules */}
                {topic.common_rules && topic.common_rules.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {topic.common_rules.map((rule, j) => (
                      <p key={j} className="text-sm text-muted-foreground font-bengali pl-3 border-l-2 border-primary/30">
                        • {rule}
                      </p>
                    ))}
                  </div>
                )}

                {/* Types */}
                {topic.types && topic.types.length > 0 && (
                  <div className="space-y-3">
                    {topic.types.map((type, j) => (
                      <div key={j} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                        <h5 className="font-semibold text-primary mb-2">{type.type}</h5>
                        {type.description && <p className="text-sm text-muted-foreground font-bengali mb-2">{type.description}</p>}
                        {type.example && <p className="text-sm text-foreground italic">• {type.example}</p>}
                        {type.structures && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {type.structures.map((s, k) => (
                              <span key={k} className="px-2 py-1 text-xs rounded bg-primary/10 text-primary font-mono">{s}</span>
                            ))}
                          </div>
                        )}
                        {type.subtypes && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {type.subtypes.map((st, k) => (
                              <span key={k} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">{st}</span>
                            ))}
                          </div>
                        )}
                        {type.examples && (
                          <div className="mt-2 space-y-1">
                            {type.examples.map((ex, k) => (
                              <p key={k} className="text-sm text-muted-foreground">• {ex}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal Auxiliaries */}
                {topic.modals && topic.modals.length > 0 && (
                  <div className="space-y-3">
                    {topic.modals.map((modal, j) => (
                      <div key={j} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                        <h5 className="font-bold text-primary mb-2">{modal.modal}</h5>
                        <div className="space-y-1 mb-3">
                          {modal.uses.map((use, k) => (
                            <p key={k} className="text-sm text-muted-foreground font-bengali">• {use}</p>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {modal.examples.map((ex, k) => (
                            <p key={k} className="text-sm text-foreground italic pl-2 border-l-2 border-primary/30">"{ex}"</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tense Structures for Voice */}
                {topic.tense_structures && topic.tense_structures.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-foreground mb-2">Tense Structures:</h5>
                    {topic.tense_structures.map((ts, j) => (
                      <p key={j} className="text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-2 rounded">{ts}</p>
                    ))}
                  </div>
                )}

                {/* Definitions (Gerund, Participle, Infinitive) */}
                {topic.definitions && topic.definitions.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {topic.definitions.map((def, j) => (
                      <div key={j} className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <h5 className="font-bold text-primary mb-2">{def.term}</h5>
                        <p className="text-sm text-muted-foreground font-bengali mb-2">{def.description}</p>
                        <p className="text-sm text-foreground italic">• {def.example}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rules */}
                {topic.rules && topic.rules.length > 0 && (
                  <div className="space-y-2">
                    {topic.rules.map((rule, j) => (
                      <div key={j} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        {rule.description && <p className="text-sm text-muted-foreground font-bengali">{rule.description}</p>}
                        {rule.example && <p className="text-sm text-foreground italic mt-1">• {rule.example}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )
      });
    });
  }

  // Chapter 9: Presentation Starting Systems
  if (chapter.starting_systems && chapter.starting_systems.length > 0) {
    lessonSections.push({
      title: 'Starting a Presentation',
      icon: <Play className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {chapter.starting_systems.map((system, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-600 flex items-center justify-center text-lg font-bold">
                  {system.system}
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">System {system.system}</span>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 mb-3">
                <p className="text-foreground leading-relaxed">{system.english}</p>
                <button onClick={() => speak(system.english)} className="mt-2 p-2 hover:bg-green-500/10 rounded-full transition-colors inline-flex items-center gap-2 text-sm text-green-600">
                  <Volume2 className="w-4 h-4" />
                  Listen
                </button>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="font-bengali text-muted-foreground leading-relaxed">{system.bangla}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  // Chapter 9: Presentation Finishing Systems
  if (chapter.finishing_systems && chapter.finishing_systems.length > 0) {
    lessonSections.push({
      title: 'Finishing a Presentation',
      icon: <Award className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {chapter.finishing_systems.map((system, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600 flex items-center justify-center text-lg font-bold">
                  {system.system}
                </span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">System {system.system}</span>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 mb-3">
                <p className="text-foreground leading-relaxed">{system.english}</p>
                <button onClick={() => speak(system.english)} className="mt-2 p-2 hover:bg-amber-500/10 rounded-full transition-colors inline-flex items-center gap-2 text-sm text-amber-600">
                  <Volume2 className="w-4 h-4" />
                  Listen
                </button>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="font-bengali text-muted-foreground leading-relaxed">{system.bangla}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  // Chapter 9: Presentation Phrases
  if (chapter.presentation_phrases && chapter.presentation_phrases.length > 0) {
    lessonSections.push({
      title: 'Useful Phrases',
      icon: <MessageCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          {chapter.presentation_phrases.map((phrase, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <p className="font-bengali text-muted-foreground mb-2">{phrase.bengali}</p>
              <div className="flex items-center gap-3">
                <p className="font-medium text-foreground flex-1">{phrase.english}</p>
                <button onClick={() => speak(phrase.english)} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                  <Volume2 className="w-4 h-4 text-primary" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )
    });
  }

  // Corona Pandemic Example (Chapter 6)
  if (chapter.corona_pandemic_example) {
    lessonSections.push({
      title: 'Linking Words in Action',
      icon: <BookMarked className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-primary">Bengali Passage:</h4>
            </div>
            <p className="font-bengali leading-relaxed text-foreground">{chapter.corona_pandemic_example.bengali}</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">English Translation:</h4>
            </div>
            <p className="leading-relaxed text-foreground">{chapter.corona_pandemic_example.english}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Linking Words Used:</h4>
            <div className="flex flex-wrap gap-2">
              {chapter.corona_pandemic_example.linking_words_used.map((word, i) => (
                <span key={i} className="px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-medium border border-primary/20">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    });
  }

  // Environment Topic Example (Chapter 5)
  if (chapter.environment_topic) {
    lessonSections.push({
      title: 'Verb+ing in Action',
      icon: <BookMarked className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-primary">Bengali Passage:</h4>
            </div>
            <p className="font-bengali leading-relaxed text-foreground">{chapter.environment_topic.bengali}</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">English Translation:</h4>
            </div>
            <p className="leading-relaxed text-foreground">{chapter.environment_topic.english}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Verb+ing Usage Highlighted:</h4>
            <div className="flex flex-wrap gap-2">
              {chapter.environment_topic.verb_ing_usage.map((usage, i) => (
                <span key={i} className="px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                  {usage}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    });
  }

  if (chapter.practice?.bengali && chapter.practice?.english) {
    lessonSections.push({
      title: 'Practice Passage',
      icon: <PenLine className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-primary">Bengali:</h4>
            </div>
            <p className="font-bengali leading-relaxed text-foreground">{chapter.practice.bengali}</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">English Translation:</h4>
            </div>
            <p className="leading-relaxed text-foreground">{chapter.practice.english}</p>
          </div>
        </div>
      )
    });
  }

  const nextChapter = chapters.find(c => c.chapter === chapterId + 1);
  const prevChapter = chapters.find(c => c.chapter === chapterId - 1);

  const currentFeedback = submittedAnswers[currentExercise]?.feedback;
  const overallScore = submittedAnswers.length > 0 
    ? Math.round(submittedAnswers.reduce((acc, a) => acc + a.feedback.score, 0) / submittedAnswers.length)
    : 0;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/grammar" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Grammar</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
              Chapter {chapter.chapter}
            </span>
            {progress?.lessonCompleted && progress?.practiceCompleted && (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{chapter.title}</h1>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabMode)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="learn" className="flex items-center gap-2 text-base font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="w-4 h-4" />
              Learn
              {progress?.lessonCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2 text-base font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <PenLine className="w-4 h-4" />
              Practice
              {progress?.practiceCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-6">
            {lessonSections.length > 0 && (
              <>
                {/* Progress */}
                <div className="flex items-center gap-4 px-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Section {currentSection + 1} of {lessonSections.length}
                  </span>
                  <Progress value={((currentSection + 1) / lessonSections.length) * 100} className="flex-1 h-2" />
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="card-academic p-6 md:p-8 shadow-lg"
                  >
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {lessonSections[currentSection].icon}
                      </div>
                      {lessonSections[currentSection].title}
                    </h3>
                    {lessonSections[currentSection].content}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(s => Math.max(0, s - 1))}
                    disabled={currentSection === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  {currentSection === lessonSections.length - 1 ? (
                    <Button
                      onClick={() => {
                        markLessonComplete(chapterId);
                        setActiveTab('practice');
                      }}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete Lesson
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentSection(s => s + 1)} className="gap-2">
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Practice Tab - Translation with AI Feedback */}
          <TabsContent value="practice" className="space-y-6">
            {!practiceStarted && !practiceComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-academic p-8 md:p-10 text-center shadow-lg"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <PenLine className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Translation Practice</h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
                  Translate {translationExercises.length} Bengali texts to English. 
                  Get instant <span className="text-primary font-semibold">AI-powered feedback</span> on your translations.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>AI Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span>Detailed Feedback</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Grammar Tips</span>
                  </div>
                </div>
                
                {progress?.practiceScore !== null && progress?.practiceScore !== undefined && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Your best score: <span className="font-bold text-primary text-lg">{progress.practiceScore}%</span>
                  </p>
                )}
                
                <Button 
                  size="lg" 
                  onClick={() => setPracticeStarted(true)} 
                  disabled={translationExercises.length === 0}
                  className="gap-2 px-8 h-12 text-base"
                >
                  <Play className="w-5 h-5" />
                  Start Practice
                </Button>
                
                {translationExercises.length === 0 && (
                  <p className="text-sm text-amber-600 mt-6">
                    No translation exercises available for this chapter yet.
                  </p>
                )}
              </motion.div>
            ) : practiceComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Results Summary */}
                <div className="card-academic p-8 md:p-10 text-center shadow-lg">
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
                    overallScore >= 70 
                      ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-600' 
                      : 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600'
                  }`}>
                    <Award className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Practice Complete!</h3>
                  <p className={`text-5xl font-bold mb-4 ${overallScore >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                    {overallScore}%
                  </p>
                  <p className="text-muted-foreground">
                    Average score across {submittedAnswers.length} translations
                  </p>
                </div>

                {/* AI Overall Feedback */}
                <div className="card-academic p-6 md:p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">AI Learning Summary</h4>
                      <p className="text-sm text-muted-foreground">Personalized feedback based on your translations</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {overallScore >= 80 
                        ? "Excellent performance! Your translations demonstrate a strong grasp of the grammar rules covered in this chapter. You're effectively applying subject-verb agreement, proper tense usage, and sentence structure. Keep up the great work!"
                        : overallScore >= 60
                        ? "Good effort! You understand the core concepts but there's room for improvement. Focus on reviewing the grammar rules, especially verb forms and sentence structure. Practice translating more passages to build confidence."
                        : "Keep practicing! Translation is a skill that improves with consistent effort. Review the lesson content again, paying special attention to the examples. Try to identify patterns in how Bengali sentences are structured differently from English."
                      }
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                        <h5 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </h5>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {submittedAnswers.flatMap(a => a.feedback.strengths).slice(0, 4).map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                        <h5 className="font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Areas to Improve
                        </h5>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {submittedAnswers.flatMap(a => a.feedback.improvements).slice(0, 4).map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Grammar Tips */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Grammar Tips to Remember
                      </h5>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {submittedAnswers.flatMap(a => a.feedback.grammarTips || []).slice(0, 4).map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Zap className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Individual Results */}
                <div className="card-academic p-6 md:p-8 shadow-lg">
                  <h4 className="font-bold text-lg mb-4">Your Translations</h4>
                  <div className="space-y-4">
                    {submittedAnswers.map((answer, idx) => (
                      <div key={idx} className={`p-5 rounded-xl border-2 ${
                        answer.feedback.isCorrect 
                          ? 'border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent' 
                          : 'border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Exercise {idx + 1}</span>
                            {answer.exercise.type === 'passage' && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Passage</span>
                            )}
                          </div>
                          <span className={`text-lg font-bold ${
                            answer.feedback.isCorrect ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {answer.feedback.score}%
                          </span>
                        </div>
                        <p className="text-sm font-bengali text-muted-foreground mb-2 line-clamp-2">{answer.exercise.bengali}</p>
                        <p className="text-sm mb-2">
                          <span className="text-muted-foreground">Your answer:</span>{' '}
                          <span className="text-foreground">{answer.userAnswer.slice(0, 150)}...</span>
                        </p>
                        {answer.feedback.correctedVersion && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <span className="text-muted-foreground">Correct:</span>{' '}
                            {answer.feedback.correctedVersion.slice(0, 150)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={restartPractice} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </Button>
                  {nextChapter && (
                    <Button onClick={() => navigate(`/grammar/${nextChapter.chapter}`)} className="gap-2">
                      Next Chapter
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Progress */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Exercise {currentExercise + 1} of {translationExercises.length}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    Completed: {submittedAnswers.length}
                  </span>
                </div>
                <Progress value={((currentExercise + 1) / translationExercises.length) * 100} className="h-2" />

                {/* Translation Exercise */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExercise}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Bengali Text */}
                    <div className="card-academic p-6 md:p-8 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold">Translate to English:</h3>
                          {translationExercises[currentExercise]?.type === 'passage' && (
                            <span className="text-xs text-primary font-medium">Full Passage Translation</span>
                          )}
                        </div>
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <p className="text-lg font-bengali leading-relaxed text-foreground">
                          {translationExercises[currentExercise]?.bengali}
                        </p>
                      </div>
                      {translationExercises[currentExercise]?.hint && (
                        <p className="text-sm text-muted-foreground mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                          <span className="font-bengali">{translationExercises[currentExercise].hint}</span>
                        </p>
                      )}
                    </div>

                    {/* Translation Input */}
                    {!showFeedback ? (
                      <div className="card-academic p-6 md:p-8 shadow-lg">
                        <label className="block text-sm font-semibold mb-3">Your Translation:</label>
                        <Textarea
                          value={userTranslation}
                          onChange={(e) => setUserTranslation(e.target.value)}
                          placeholder="Type your English translation here..."
                          className="min-h-[150px] text-base resize-none border-2 focus:border-primary"
                          disabled={isAnalyzing}
                        />
                        <div className="flex justify-end mt-4">
                          <Button 
                            onClick={handleSubmitTranslation}
                            disabled={!userTranslation.trim() || isAnalyzing}
                            className="gap-2 px-6"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing with AI...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Submit
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : currentFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* Score */}
                        <div className={`card-academic p-6 md:p-8 border-2 shadow-lg ${
                          currentFeedback.isCorrect 
                            ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent' 
                            : 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent'
                        }`}>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                                currentFeedback.isCorrect 
                                  ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-600' 
                                  : 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600'
                              }`}>
                                {currentFeedback.isCorrect ? <CheckCircle className="w-7 h-7" /> : <Brain className="w-7 h-7" />}
                              </div>
                              <div>
                                <p className={`text-3xl font-bold ${
                                  currentFeedback.isCorrect ? 'text-green-600' : 'text-amber-600'
                                }`}>
                                  {currentFeedback.score}%
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {currentFeedback.isCorrect ? 'Great job!' : 'Keep practicing!'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span>AI Feedback</span>
                            </div>
                          </div>

                          {/* Feedback sections */}
                          <div className="space-y-4">
                            {/* Overall Comment */}
                            <p className="text-muted-foreground leading-relaxed">{currentFeedback.overallComment}</p>
                            
                            {/* Strengths & Improvements Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {currentFeedback.strengths.length > 0 && (
                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                  <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2 text-sm flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Strengths
                                  </h5>
                                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                                    {currentFeedback.strengths.map((s, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>{s}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {currentFeedback.improvements.length > 0 && (
                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                  <h5 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 text-sm flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Areas to Improve
                                  </h5>
                                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                                    {currentFeedback.improvements.map((s, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-amber-500">•</span>
                                        <span>{s}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Corrected Version */}
                            {currentFeedback.correctedVersion && (
                              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <h5 className="font-semibold text-primary mb-2 text-sm flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  Reference Translation
                                </h5>
                                <p className="text-sm text-foreground leading-relaxed">{currentFeedback.correctedVersion}</p>
                              </div>
                            )}
                            
                            {/* Grammar Tips */}
                            {currentFeedback.grammarTips && currentFeedback.grammarTips.length > 0 && (
                              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                <h5 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-primary" />
                                  Grammar Tips
                                </h5>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                  {currentFeedback.grammarTips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <Zap className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end mt-6">
                            <Button onClick={handleNextExercise} className="gap-2 px-6">
                              {currentExercise + 1 >= translationExercises.length ? 'See Results' : 'Next Exercise'}
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Chapter Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-10 pt-6 border-t border-border"
        >
          {prevChapter ? (
            <Link to={`/grammar/${prevChapter.chapter}`}>
              <Button variant="ghost" className="gap-2 group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Ch. {prevChapter.chapter}:</span> {prevChapter.title.slice(0, 20)}...
              </Button>
            </Link>
          ) : <div />}
          
          {nextChapter && (
            <Link to={`/grammar/${nextChapter.chapter}`}>
              <Button variant="ghost" className="gap-2 group">
                <span className="hidden sm:inline">Ch. {nextChapter.chapter}:</span> {nextChapter.title.slice(0, 20)}...
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}

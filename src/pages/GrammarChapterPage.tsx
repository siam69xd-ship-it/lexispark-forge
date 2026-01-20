import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, CheckCircle, Play, Award,
  ChevronRight, ChevronLeft, Volume2, Lightbulb,
  FileText, Target, Sparkles, Brain, PenLine, Send,
  RotateCcw, MessageCircle
} from 'lucide-react';
import { useGrammar } from '@/context/GrammarContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type TabMode = 'learn' | 'practice';

interface TranslationExercise {
  id: number;
  bengali: string;
  english: string;
  hint?: string;
}

interface SubmittedAnswer {
  exercise: TranslationExercise;
  userAnswer: string;
  feedback: {
    score: number;
    isCorrect: boolean;
    strengths: string[];
    improvements: string[];
    correctedVersion?: string;
  };
}

export default function GrammarChapterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  // Generate translation exercises from chapter content
  const translationExercises = useMemo((): TranslationExercise[] => {
    if (!chapter) return [];
    
    const exercises: TranslationExercise[] = [];
    let idCounter = 1;
    
    // From practice passage
    if (chapter.practice?.bengali && chapter.practice?.english) {
      // Split into sentences if long
      const bengaliSentences = chapter.practice.bengali.split(/[।\.]/).filter(s => s.trim().length > 10);
      const englishSentences = chapter.practice.english.split(/\./).filter(s => s.trim().length > 10);
      
      bengaliSentences.slice(0, 3).forEach((bengali, i) => {
        if (englishSentences[i]) {
          exercises.push({
            id: idCounter++,
            bengali: bengali.trim(),
            english: englishSentences[i].trim() + '.'
          });
        }
      });
    }
    
    // From practice exercises
    if (chapter.practice_exercises) {
      chapter.practice_exercises.slice(0, 3).forEach((ex) => {
        exercises.push({
          id: idCounter++,
          bengali: ex.bengali,
          english: ex.english
        });
      });
    }
    
    // From projects
    if (chapter.projects) {
      chapter.projects.slice(0, 3).forEach((proj) => {
        if (proj.bengali && proj.english) {
          exercises.push({
            id: idCounter++,
            bengali: proj.bengali,
            english: proj.english
          });
        } else if (proj.passage && proj.translation) {
          exercises.push({
            id: idCounter++,
            bengali: proj.passage.slice(0, 200),
            english: proj.translation.slice(0, 200)
          });
        }
      });
    }
    
    // From content examples
    if (chapter.content) {
      chapter.content.forEach(section => {
        if (section.examples) {
          section.examples.slice(0, 2).forEach(ex => {
            if (ex.bengali && ex.english) {
              exercises.push({
                id: idCounter++,
                bengali: ex.bengali,
                english: ex.english
              });
            }
          });
        }
      });
    }
    
    // From rules examples
    if (chapter.rules) {
      chapter.rules.slice(0, 2).forEach(rule => {
        if (rule.examples && rule.examples.length > 0) {
          exercises.push({
            id: idCounter++,
            bengali: `Translate using this rule: ${rule.description?.slice(0, 50)}...`,
            english: rule.examples[0],
            hint: rule.description
          });
        }
      });
    }
    
    return exercises.slice(0, 5);
  }, [chapter]);

  // AI-style feedback generator
  const generateFeedback = (userAnswer: string, correctAnswer: string): SubmittedAnswer['feedback'] => {
    const userWords = userAnswer.toLowerCase().trim().split(/\s+/);
    const correctWords = correctAnswer.toLowerCase().trim().split(/\s+/);
    
    // Calculate similarity
    const matchingWords = userWords.filter(w => correctWords.includes(w));
    const similarity = matchingWords.length / Math.max(correctWords.length, 1);
    const score = Math.round(similarity * 100);
    
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    // Analyze answer quality
    if (similarity >= 0.8) {
      strengths.push("Excellent word choice and sentence structure");
      if (userAnswer.includes('.') || userAnswer.includes('?')) {
        strengths.push("Proper punctuation used");
      }
    } else if (similarity >= 0.5) {
      strengths.push("Good understanding of the main concept");
      if (matchingWords.length > 3) {
        strengths.push(`Key vocabulary captured (${matchingWords.slice(0, 3).join(', ')})`);
      }
    } else {
      if (matchingWords.length > 0) {
        strengths.push(`Some key words used correctly`);
      }
    }
    
    // Check for common grammar patterns
    const hasVerb = /\b(is|are|was|were|has|have|had|do|does|did|will|would|can|could|should)\b/i.test(userAnswer);
    if (hasVerb) {
      strengths.push("Correct verb usage detected");
    } else if (userAnswer.length > 10) {
      improvements.push("Check your verb forms (is/are, was/were, has/have)");
    }
    
    // Suggest improvements
    if (similarity < 0.8) {
      if (userAnswer.length < correctAnswer.length * 0.5) {
        improvements.push("Your translation seems incomplete - try to include all parts of the sentence");
      }
      if (!userAnswer.match(/^[A-Z]/)) {
        improvements.push("Start sentences with a capital letter");
      }
      if (similarity < 0.5) {
        improvements.push("Review the grammar rules in this chapter and try again");
        improvements.push("Pay attention to subject-verb agreement");
      }
    }
    
    // Check article usage
    if (correctAnswer.toLowerCase().includes('the ') && !userAnswer.toLowerCase().includes('the ')) {
      improvements.push("Consider using definite article 'the' where appropriate");
    }
    
    return {
      score,
      isCorrect: score >= 70,
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
      correctedVersion: score < 90 ? correctAnswer : undefined
    };
  };

  const handleSubmitTranslation = () => {
    if (!userTranslation.trim() || !translationExercises[currentExercise]) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const exercise = translationExercises[currentExercise];
      const feedback = generateFeedback(userTranslation, exercise.english);
      
      setSubmittedAnswers(prev => [...prev, {
        exercise,
        userAnswer: userTranslation,
        feedback
      }]);
      
      setShowFeedback(true);
      setIsAnalyzing(false);
    }, 800);
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
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Chapter not found</p>
        <Link to="/grammar">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grammar
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate lesson sections
  const lessonSections: { title: string; content: React.ReactNode }[] = [];
  
  if (chapter.content) {
    chapter.content.forEach(section => {
      lessonSections.push({
        title: section.section || 'Introduction',
        content: (
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed font-bengali">{section.text}</p>
            {section.examples && section.examples.length > 0 && (
              <div className="space-y-3 mt-4">
                {section.examples.map((ex, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                    {ex.bengali && <p className="font-bengali text-muted-foreground mb-2">{ex.bengali}</p>}
                    {ex.english && (
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{ex.english}</p>
                        <button onClick={() => speak(ex.english || '')} className="p-1 hover:bg-primary/10 rounded">
                          <Volume2 className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    )}
                    {ex.question && (
                      <p className="text-sm text-primary mt-2">
                        <span className="font-medium">Q:</span> {ex.question}
                      </p>
                    )}
                    {ex.answer && (
                      <p className="text-sm text-green-600 dark:text-green-400">
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
      content: (
        <div className="space-y-4">
          {chapter.rules.map((rule, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {rule.number || i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium font-bengali mb-3">{rule.description}</p>
                  {rule.examples && (
                    <div className="space-y-2">
                      {rule.examples.map((ex, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                          <span>{ex}</span>
                          <button onClick={() => speak(ex)} className="p-1 hover:bg-primary/10 rounded">
                            <Volume2 className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    });
  }

  if (chapter.shortcut_tips) {
    lessonSections.push({
      title: 'Quick Tips',
      content: (
        <div className="space-y-4">
          {chapter.shortcut_tips.map((tip, i) => (
            <div key={i} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium font-bengali mb-2">{tip.tip}</p>
                  {tip.examples && (
                    <div className="space-y-1">
                      {tip.examples.map((ex, j) => (
                        <p key={j} className="text-sm text-muted-foreground italic">• {ex}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    });
  }

  if (chapter.pronouns) {
    lessonSections.push({
      title: 'Pronouns',
      content: (
        <div className="space-y-4">
          {chapter.pronouns.map((p, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold text-primary mb-2">{p.pronoun}</h4>
              <p className="text-sm text-muted-foreground font-bengali mb-2">{p.usage}</p>
              <p className="text-sm italic">{p.example}</p>
            </div>
          ))}
        </div>
      )
    });
  }

  if (chapter.tenses) {
    lessonSections.push({
      title: 'Tense Structures',
      content: (
        <div className="space-y-4">
          {chapter.tenses.map((t, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold text-primary mb-1">{t.tense}</h4>
              <p className="text-sm text-muted-foreground mb-3 font-mono bg-muted/50 px-2 py-1 rounded inline-block">{t.structure}</p>
              <div className="space-y-1">
                {t.examples.map((ex, j) => (
                  <p key={j} className="text-sm text-muted-foreground">• {ex}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    });
  }

  if (chapter.connectors) {
    lessonSections.push({
      title: 'Linking Words',
      content: (
        <div className="space-y-4">
          {chapter.connectors.map((c, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold mb-2">{c.category}</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {c.words.map((w, j) => (
                  <span key={j} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">{w}</span>
                ))}
              </div>
              <div className="space-y-1">
                {c.examples.map((ex, j) => (
                  <p key={j} className="text-sm text-muted-foreground italic">• {ex}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    });
  }

  if (chapter.common_uses) {
    lessonSections.push({
      title: 'Common Uses',
      content: (
        <div className="space-y-4">
          {chapter.common_uses.map((use, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold text-primary mb-2">{use.use}</h4>
              {use.description && <p className="text-sm text-muted-foreground font-bengali mb-2">{use.description}</p>}
              {use.rule && <p className="text-sm text-muted-foreground font-bengali mb-2">{use.rule}</p>}
              {use.verbs && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {use.verbs.map((v, j) => (
                    <span key={j} className="px-2 py-0.5 text-xs rounded bg-muted">{v}</span>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                {use.examples.map((ex, j) => (
                  <p key={j} className="text-sm text-muted-foreground">• {ex}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    });
  }

  if (chapter.practice) {
    lessonSections.push({
      title: 'Practice Passage',
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="text-sm font-medium text-primary mb-2">Bengali:</h4>
            <p className="font-bengali leading-relaxed">{chapter.practice.bengali}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">English Translation:</h4>
            <p className="leading-relaxed">{chapter.practice.english}</p>
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
    <div className="min-h-screen pt-20 pb-16 bg-background">
      <div className="container-narrow">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/grammar" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Grammar</span>
          </Link>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Chapter {chapter.chapter}</span>
            {progress?.lessonCompleted && progress?.practiceCompleted && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold">{chapter.title}</h1>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabMode)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="learn" className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4" />
              Learn
              {progress?.lessonCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2 text-base">
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
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Section {currentSection + 1} of {lessonSections.length}</span>
                  <Progress value={((currentSection + 1) / lessonSections.length) * 100} className="flex-1 h-2" />
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card-academic p-6"
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
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
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentSection === lessonSections.length - 1 ? (
                    <Button
                      onClick={() => {
                        markLessonComplete(chapterId);
                        setActiveTab('practice');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Lesson
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentSection(s => s + 1)}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Practice Tab - Translation Mode */}
          <TabsContent value="practice" className="space-y-6">
            {!practiceStarted && !practiceComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-academic p-8 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <PenLine className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Translation Practice</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Translate {translationExercises.length} Bengali sentences to English. 
                  Get instant AI feedback on your translations.
                </p>
                
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>AI Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span>Detailed Analysis</span>
                  </div>
                </div>
                
                {progress?.practiceScore !== null && progress?.practiceScore !== undefined && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Your best score: <span className="font-semibold text-primary">{progress.practiceScore}%</span>
                  </p>
                )}
                
                <Button size="lg" onClick={() => setPracticeStarted(true)} disabled={translationExercises.length === 0}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Practice
                </Button>
                
                {translationExercises.length === 0 && (
                  <p className="text-sm text-amber-600 mt-4">
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
                <div className="card-academic p-8 text-center">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                    overallScore >= 70 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Practice Complete!</h3>
                  <p className="text-4xl font-bold text-primary mb-4">{overallScore}%</p>
                  <p className="text-muted-foreground mb-6">
                    Average score across {submittedAnswers.length} translations
                  </p>
                </div>

                {/* AI Overall Feedback */}
                <div className="card-academic p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold">AI Learning Feedback</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <p className="text-muted-foreground leading-relaxed">
                      {overallScore >= 80 
                        ? "Excellent performance! Your translations demonstrate a strong grasp of the grammar rules covered in this chapter. You're effectively applying subject-verb agreement, proper tense usage, and sentence structure. Keep up the great work!"
                        : overallScore >= 60
                        ? "Good effort! You understand the core concepts but there's room for improvement. Focus on reviewing the grammar rules, especially verb forms and sentence structure. Practice translating more passages to build confidence."
                        : "Keep practicing! Translation is a skill that improves with consistent effort. Review the lesson content again, paying special attention to the examples. Try to identify patterns in how Bengali sentences are structured differently from English."
                      }
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                        <h5 className="font-medium text-green-600 dark:text-green-400 mb-2">Strengths</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          {submittedAnswers.flatMap(a => a.feedback.strengths).slice(0, 3).map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <h5 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Areas to Improve</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          {submittedAnswers.flatMap(a => a.feedback.improvements).slice(0, 3).map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Results */}
                <div className="card-academic p-6">
                  <h4 className="font-semibold mb-4">Your Translations</h4>
                  <div className="space-y-4">
                    {submittedAnswers.map((answer, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${
                        answer.feedback.isCorrect 
                          ? 'border-green-500/30 bg-green-500/5' 
                          : 'border-amber-500/30 bg-amber-500/5'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Exercise {idx + 1}</span>
                          <span className={`text-sm font-semibold ${
                            answer.feedback.isCorrect ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {answer.feedback.score}%
                          </span>
                        </div>
                        <p className="text-sm font-bengali text-muted-foreground mb-2">{answer.exercise.bengali}</p>
                        <p className="text-sm mb-2"><span className="text-muted-foreground">Your answer:</span> {answer.userAnswer}</p>
                        {answer.feedback.correctedVersion && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <span className="text-muted-foreground">Correct:</span> {answer.feedback.correctedVersion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={restartPractice}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  {nextChapter && (
                    <Button onClick={() => navigate(`/grammar/${nextChapter.chapter}`)}>
                      Next Chapter
                      <ChevronRight className="w-4 h-4 ml-2" />
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Exercise {currentExercise + 1} of {translationExercises.length}
                  </span>
                  <span className="font-medium text-primary">
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
                    <div className="card-academic p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Translate to English:</h3>
                      </div>
                      <p className="text-lg font-bengali leading-relaxed p-4 rounded-lg bg-primary/5 border border-primary/10">
                        {translationExercises[currentExercise]?.bengali}
                      </p>
                      {translationExercises[currentExercise]?.hint && (
                        <p className="text-sm text-muted-foreground mt-3 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                          <span className="font-bengali">{translationExercises[currentExercise].hint}</span>
                        </p>
                      )}
                    </div>

                    {/* Translation Input */}
                    {!showFeedback ? (
                      <div className="card-academic p-6">
                        <label className="block text-sm font-medium mb-3">Your Translation:</label>
                        <Textarea
                          value={userTranslation}
                          onChange={(e) => setUserTranslation(e.target.value)}
                          placeholder="Type your English translation here..."
                          className="min-h-[120px] text-base resize-none"
                          disabled={isAnalyzing}
                        />
                        <div className="flex justify-end mt-4">
                          <Button 
                            onClick={handleSubmitTranslation}
                            disabled={!userTranslation.trim() || isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
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
                        <div className={`card-academic p-6 border-2 ${
                          currentFeedback.isCorrect 
                            ? 'border-green-500/30 bg-green-500/5' 
                            : 'border-amber-500/30 bg-amber-500/5'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                currentFeedback.isCorrect 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {currentFeedback.isCorrect ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : (
                                  <Lightbulb className="w-6 h-6" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {currentFeedback.isCorrect ? 'Great job!' : 'Good attempt!'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Score: {currentFeedback.score}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Your Answer */}
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-1">Your translation:</p>
                            <p className="text-muted-foreground">{userTranslation}</p>
                          </div>

                          {/* Correct Answer */}
                          {currentFeedback.correctedVersion && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Suggested translation:</p>
                              <p className="text-foreground">{currentFeedback.correctedVersion}</p>
                            </div>
                          )}
                        </div>

                        {/* AI Feedback */}
                        <div className="card-academic p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">AI Feedback</h4>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            {currentFeedback.strengths.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Strengths:</h5>
                                <ul className="space-y-1">
                                  {currentFeedback.strengths.map((s, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {currentFeedback.improvements.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">To improve:</h5>
                                <ul className="space-y-1">
                                  {currentFeedback.improvements.map((s, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Next Button */}
                        <div className="flex justify-end">
                          <Button onClick={handleNextExercise}>
                            {currentExercise + 1 >= translationExercises.length ? 'See Results' : 'Next Exercise'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
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
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          {prevChapter ? (
            <Link to={`/grammar/${prevChapter.chapter}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Ch. {prevChapter.chapter}: {prevChapter.title.slice(0, 20)}...
              </Button>
            </Link>
          ) : <div />}
          
          {nextChapter && (
            <Link to={`/grammar/${nextChapter.chapter}`}>
              <Button variant="outline" size="sm">
                Ch. {nextChapter.chapter}: {nextChapter.title.slice(0, 20)}...
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

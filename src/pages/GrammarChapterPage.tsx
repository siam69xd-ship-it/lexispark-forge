import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, CheckCircle, Play, Award,
  ChevronRight, ChevronLeft, Volume2, Lightbulb,
  FileText, Target, Sparkles, Brain
} from 'lucide-react';
import { useGrammar } from '@/context/GrammarContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabMode = 'learn' | 'practice';

export default function GrammarChapterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getChapter, markLessonComplete, savePracticeScore, getChapterProgress, chapters } = useGrammar();
  
  const chapterId = parseInt(id || '1');
  const chapter = getChapter(chapterId);
  const progress = getChapterProgress(chapterId);
  
  const [activeTab, setActiveTab] = useState<TabMode>('learn');
  const [currentSection, setCurrentSection] = useState(0);
  
  // Practice quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<{ question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[]>([]);

  // Generate practice questions from chapter content
  const practiceQuestions = useMemo(() => {
    if (!chapter) return [];
    
    const questions: { question: string; options: string[]; correct: string; explanation: string }[] = [];
    
    // From rules
    if (chapter.rules) {
      chapter.rules.slice(0, 5).forEach((rule, idx) => {
        if (rule.examples && rule.examples.length > 0) {
          const example = rule.examples[0];
          questions.push({
            question: `Which sentence follows the rule: "${rule.description?.slice(0, 80)}..."?`,
            options: [
              example,
              example.replace(/is|are|was|were|has|have/gi, (m) => 
                m === 'is' ? 'are' : m === 'are' ? 'is' : m === 'was' ? 'were' : m === 'were' ? 'was' : m === 'has' ? 'have' : 'has'
              ),
              'None of these apply',
              'Both options are correct'
            ].slice(0, 4),
            correct: example,
            explanation: rule.description || ''
          });
        }
      });
    }
    
    // From practice exercises
    if (chapter.practice_exercises) {
      chapter.practice_exercises.slice(0, 3).forEach((ex) => {
        questions.push({
          question: `Translate: "${ex.bengali}"`,
          options: [
            ex.english,
            ex.english.split(' ').reverse().join(' ').slice(0, 50) + '...',
            'The translation is grammatically incorrect',
            'This cannot be translated'
          ],
          correct: ex.english,
          explanation: `The correct translation uses proper grammar rules.`
        });
      });
    }
    
    // From shortcut tips
    if (chapter.shortcut_tips) {
      chapter.shortcut_tips.slice(0, 2).forEach((tip) => {
        if (tip.examples && tip.examples.length > 0) {
          questions.push({
            question: `According to the tip: "${tip.tip.slice(0, 60)}..." - which example is correct?`,
            options: [
              tip.examples[0],
              tip.examples[0].replace(/singular|plural/gi, m => m === 'singular' ? 'plural' : 'singular'),
              'This tip does not apply here',
              'All examples are incorrect'
            ].slice(0, 4),
            correct: tip.examples[0],
            explanation: tip.tip
          });
        }
      });
    }
    
    // Ensure at least 5 questions
    while (questions.length < 5 && chapter.content) {
      const section = chapter.content[questions.length % chapter.content.length];
      if (section.text) {
        questions.push({
          question: `What is the main concept of "${section.section}"?`,
          options: [
            section.text.slice(0, 60) + '...',
            'This section is about vocabulary',
            'This section is about pronunciation',
            'This section is not related to grammar'
          ],
          correct: section.text.slice(0, 60) + '...',
          explanation: section.text
        });
      }
    }
    
    return questions.slice(0, 10);
  }, [chapter]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === practiceQuestions[currentQuestion].correct;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, {
      question: practiceQuestions[currentQuestion].question,
      userAnswer: answer,
      correctAnswer: practiceQuestions[currentQuestion].correct,
      isCorrect
    }]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= practiceQuestions.length) {
      setQuizComplete(true);
      const finalScore = Math.round((score / practiceQuestions.length) * 100);
      savePracticeScore(chapterId, finalScore);
    } else {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setAnswers([]);
    setQuizStarted(true);
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

  // Add practice passage if available
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
              <Brain className="w-4 h-4" />
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

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            {!quizStarted && !quizComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-academic p-8 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Test Your Knowledge</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Answer {practiceQuestions.length} questions to test your understanding of this chapter's grammar rules.
                </p>
                {progress?.practiceScore !== null && progress?.practiceScore !== undefined && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Your best score: <span className="font-semibold text-primary">{progress.practiceScore}%</span>
                  </p>
                )}
                <Button size="lg" onClick={() => setQuizStarted(true)}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Practice
                </Button>
              </motion.div>
            ) : quizComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-academic p-8 text-center"
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                  score / practiceQuestions.length >= 0.7 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  <Award className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Practice Complete!</h3>
                <p className="text-4xl font-bold text-primary mb-4">
                  {Math.round((score / practiceQuestions.length) * 100)}%
                </p>
                <p className="text-muted-foreground mb-6">
                  You got {score} out of {practiceQuestions.length} questions correct
                </p>
                
                {/* AI Feedback */}
                <div className="text-left p-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Learning Feedback</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {score / practiceQuestions.length >= 0.8 
                      ? "Excellent work! You have a strong understanding of this chapter's grammar rules. Keep practicing to maintain your skills."
                      : score / practiceQuestions.length >= 0.6
                      ? "Good effort! You understand most concepts, but reviewing the rules you missed will help strengthen your grammar foundation."
                      : "Keep practicing! Review the lesson content again, especially the examples. Focus on understanding the patterns in each rule."
                    }
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={restartQuiz}>
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
                    Question {currentQuestion + 1} of {practiceQuestions.length}
                  </span>
                  <span className="font-medium text-primary">Score: {score}</span>
                </div>
                <Progress value={((currentQuestion + 1) / practiceQuestions.length) * 100} className="h-2" />

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card-academic p-6"
                  >
                    <h3 className="text-lg font-medium mb-6">{practiceQuestions[currentQuestion].question}</h3>
                    
                    <div className="space-y-3">
                      {practiceQuestions[currentQuestion].options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === practiceQuestions[currentQuestion].correct;
                        const showCorrectness = showResult;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => !showResult && handleAnswer(option)}
                            disabled={showResult}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              showCorrectness && isCorrect
                                ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300'
                                : showCorrectness && isSelected && !isCorrect
                                ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300'
                                : isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm shrink-0">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-sm">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span className="font-medium text-sm">Explanation</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {practiceQuestions[currentQuestion].explanation}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Next Button */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-end"
                  >
                    <Button onClick={nextQuestion}>
                      {currentQuestion + 1 >= practiceQuestions.length ? 'See Results' : 'Next Question'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
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

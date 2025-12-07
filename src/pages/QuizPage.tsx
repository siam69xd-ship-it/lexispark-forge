import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight, Shuffle, Target, Settings, Minus, Plus } from 'lucide-react';
import { useWords } from '@/context/WordContext';
import { Word } from '@/lib/wordParser';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type QuizType = 'definition' | 'synonym' | 'fillblank' | 'mixed';

interface Question {
  type: 'definition' | 'synonym' | 'antonym' | 'fillblank';
  word: Word;
  question: string;
  options: string[];
  correctAnswer: string;
  blankSentence?: string;
}

export default function QuizPage() {
  const { words } = useWords();
  
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  
  // Quiz configuration
  const [questionCount, setQuestionCount] = useState(10);
  const [useDifficulty, setUseDifficulty] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showConfig, setShowConfig] = useState(false);

  const maxQuestions = useMemo(() => {
    if (useDifficulty) {
      return words.filter(w => w.difficulty === selectedDifficulty).length;
    }
    return words.length;
  }, [words, useDifficulty, selectedDifficulty]);

  const incrementCount = () => {
    setQuestionCount(prev => Math.min(prev + 5, maxQuestions));
  };

  const decrementCount = () => {
    setQuestionCount(prev => Math.max(prev - 5, 10));
  };

  const generateQuestions = (type: QuizType): Question[] => {
    let availableWords = [...words];
    
    // Filter by difficulty if enabled
    if (useDifficulty) {
      availableWords = availableWords.filter(w => w.difficulty === selectedDifficulty);
    }
    
    // Shuffle and select based on count
    const shuffledWords = availableWords
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(questionCount, availableWords.length));
    
    return shuffledWords.map(word => {
      const qType = type === 'mixed' 
        ? (['definition', 'synonym', 'fillblank'] as const)[Math.floor(Math.random() * 3)]
        : type === 'synonym' ? 'synonym' : type === 'fillblank' ? 'fillblank' : 'definition';

      if (qType === 'fillblank' && word.examples.length > 0) {
        const example = word.examples[Math.floor(Math.random() * word.examples.length)];
        const blankSentence = example.replace(new RegExp(word.word, 'gi'), '_____');
        const wrongWords = words
          .filter(w => w.id !== word.id && w.partOfSpeech === word.partOfSpeech)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.word);
        
        return {
          type: 'fillblank',
          word,
          question: 'Fill in the blank:',
          blankSentence: blankSentence !== example ? blankSentence : `The word "${word.word}" means: _____`,
          options: [...wrongWords, word.word].sort(() => Math.random() - 0.5),
          correctAnswer: word.word,
        };
      }

      if (qType === 'synonym' && word.synonyms.length > 0) {
        const correctSynonym = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
        const wrongOptions = words
          .filter(w => w.id !== word.id)
          .flatMap(w => w.synonyms)
          .filter(s => !word.synonyms.includes(s))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        return {
          type: 'synonym',
          word,
          question: `Which is a synonym of "${word.word}"?`,
          options: [...wrongOptions, correctSynonym].sort(() => Math.random() - 0.5),
          correctAnswer: correctSynonym,
        };
      }

      // Default: definition question - use Bangla meaning
      const wrongMeanings = words
        .filter(w => w.id !== word.id && w.banglaMeaning)
        .map(w => w.banglaMeaning.slice(0, 80))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      return {
        type: 'definition',
        word,
        question: `"${word.word}" এর অর্থ কী?`,
        options: [...wrongMeanings, word.banglaMeaning.slice(0, 80)].sort(() => Math.random() - 0.5),
        correctAnswer: word.banglaMeaning.slice(0, 80),
      };
    });
  };

  const startQuiz = (type: QuizType) => {
    setQuizType(type);
    setQuestions(generateQuestions(type));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setAnswers([]);
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    const isCorrect = answer === questions[currentIndex].correctAnswer;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(a => [...a, isCorrect]);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restartQuiz = () => {
    if (quizType) startQuiz(quizType);
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const quizTypes = [
    { type: 'definition' as QuizType, label: 'Definition Quiz', desc: 'Match words with their meanings', icon: Target },
    { type: 'synonym' as QuizType, label: 'Synonym Quiz', desc: 'Find the synonyms', icon: Shuffle },
    { type: 'fillblank' as QuizType, label: 'Fill in Blanks', desc: 'Complete the sentences', icon: Brain },
    { type: 'mixed' as QuizType, label: 'Mixed Quiz', desc: 'All question types', icon: Trophy },
  ];

  const difficultyOptions = [
    { value: 'easy' as const, label: 'Easy', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'medium' as const, label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'hard' as const, label: 'Hard', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  // Quiz Selection Screen
  if (!quizType) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Test Your Knowledge</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Choose Your <span className="gradient-text">Quiz</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select a quiz type and configure your preferences
            </p>
          </motion.div>

          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-border/50 mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Quiz Configuration</h2>
            </div>

            {/* Question Count */}
            <div className="mb-6">
              <Label className="text-sm text-muted-foreground mb-3 block">Number of Questions (min: 10)</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementCount}
                  disabled={questionCount <= 10}
                  className="rounded-xl h-12 w-12"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-bold gradient-text">{questionCount}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max available: {maxQuestions}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementCount}
                  disabled={questionCount >= maxQuestions}
                  className="rounded-xl h-12 w-12"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm">Filter by Difficulty</Label>
                <Switch
                  checked={useDifficulty}
                  onCheckedChange={setUseDifficulty}
                />
              </div>
              
              {useDifficulty && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex gap-3"
                >
                  {difficultyOptions.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedDifficulty(value)}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        selectedDifficulty === value
                          ? color
                          : 'border-border/50 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Quiz Type Selection */}
          <div className="grid sm:grid-cols-2 gap-4">
            {quizTypes.map(({ type, label, desc, icon: Icon }, index) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => startQuiz(type)}
                className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 text-left transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                >
                  <Icon className="w-7 h-7 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {label}
                </h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Complete Screen
  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container mx-auto px-4 max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center"
          >
            <Trophy className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          
          <h1 className="text-4xl font-bold font-display mb-4">Quiz Complete!</h1>
          
          <div className="glass rounded-3xl p-8 border border-border/50 mb-6">
            <div className="text-6xl font-bold gradient-text mb-2">{percentage}%</div>
            <p className="text-muted-foreground mb-4">
              You got {score} out of {questions.length} correct
            </p>
            
            <div className="flex flex-wrap justify-center gap-1 mb-4 max-h-20 overflow-y-auto">
              {answers.map((correct, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 1) }}
                  className={`w-2.5 h-2.5 rounded-full ${correct ? 'bg-green-500' : 'bg-red-500'}`}
                />
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {percentage >= 80 ? '🎉 Excellent work!' : percentage >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={restartQuiz} size="lg" className="rounded-xl gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button onClick={() => setQuizType(null)} variant="outline" size="lg" className="rounded-xl">
              Different Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Question Screen
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">Score: {score}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass rounded-3xl p-6 md:p-8 border border-border/50"
          >
            {/* Question Type Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                {currentQuestion.type}
              </span>
              {useDifficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  difficultyOptions.find(d => d.value === selectedDifficulty)?.color
                }`}>
                  {selectedDifficulty}
                </span>
              )}
            </div>

            {/* Question */}
            <h2 className="text-xl md:text-2xl font-bold mb-6">
              {currentQuestion.question}
            </h2>

            {/* Blank Sentence */}
            {currentQuestion.blankSentence && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
                <p className="text-lg italic">"{currentQuestion.blankSentence}"</p>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                      showCorrect
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : showWrong
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : isSelected
                        ? 'bg-primary/20 border-primary'
                        : 'bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50'
                    } border`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showCorrect && <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />}
                    {showWrong && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Next Button */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6"
                >
                  <Button
                    onClick={nextQuestion}
                    size="lg"
                    className="w-full rounded-xl gap-2"
                  >
                    {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Quit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Button
            variant="ghost"
            onClick={() => setQuizType(null)}
            className="text-muted-foreground"
          >
            Quit Quiz
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

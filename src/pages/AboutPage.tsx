import { motion } from 'framer-motion';
import { BookOpen, Brain, Layers, Target, Users, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWords } from '@/context/WordContext';

export default function AboutPage() {
  const { words } = useWords();

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Word Library',
      description: 'Access thousands of carefully curated vocabulary words with detailed definitions, pronunciations, and contextual examples.',
    },
    {
      icon: Brain,
      title: 'Smart Quizzes',
      description: 'Auto-generated quizzes including MCQs, matching tests, and fill-in-the-blanks to test and reinforce your learning.',
    },
    {
      icon: Layers,
      title: 'Interactive Flashcards',
      description: 'Swipe through flashcards with smooth animations. Mark words as memorized and track your progress.',
    },
    {
      icon: Target,
      title: 'Bilingual Support',
      description: 'Every word includes detailed Bangla meanings and translations alongside English definitions.',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">About VocaForge</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Built for <span className="gradient-text">Vocabulary Mastery</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            VocaForge is the ultimate platform for building an unshakeable vocabulary. 
            Whether you're preparing for exams or expanding your word power, we've got you covered.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { value: words.length.toLocaleString(), label: 'Words' },
            { value: '4+', label: 'Quiz Types' },
            { value: '2', label: 'Languages' },
            { value: '∞', label: 'Practice' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl glass border border-border/50 text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold font-display text-center mb-8">
            Why Choose VocaForge?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-2xl glass border border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold font-display text-center mb-8">
            How It Works
          </h2>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Browse Words', desc: 'Explore our comprehensive word library with filters for difficulty, part of speech, and alphabetical order.' },
              { step: '2', title: 'Learn & Save', desc: 'Click on any word to see detailed definitions, examples, synonyms, and Bangla meanings. Save words to your flashcard deck.' },
              { step: '3', title: 'Practice', desc: 'Use flashcards for active recall practice. Swipe through cards and mark words as memorized.' },
              { step: '4', title: 'Test Yourself', desc: 'Take auto-generated quizzes to test your knowledge with various question types.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center p-8 rounded-3xl glass border border-primary/20"
        >
          <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-6">
            Begin your vocabulary journey today with thousands of words at your fingertips.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/words">
              <Button size="lg" className="rounded-xl bg-gradient-button glow">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Words
              </Button>
            </Link>
            <Link to="/quiz">
              <Button size="lg" variant="outline" className="rounded-xl">
                <Brain className="w-5 h-5 mr-2" />
                Start Quiz
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Footer Credit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-muted-foreground text-sm"
        >
          <p>Built with ❤️ for vocabulary enthusiasts</p>
          <p className="mt-1">Data sourced from Ultimate Job Solutions</p>
        </motion.div>
      </div>
    </div>
  );
}

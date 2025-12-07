import { motion } from 'framer-motion';
import { BookOpen, Brain, Layers, Sparkles, TrendingUp, Zap } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import SearchBar from '@/components/SearchBar';
import FeatureCard from '@/components/FeatureCard';
import WordCard from '@/components/WordCard';
import { useWords } from '@/context/WordContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { words, loading } = useWords();
  const featuredWords = words.slice(0, 6);

  const features = [
    {
      title: 'Learn Words',
      description: 'Explore our comprehensive vocabulary library with detailed meanings, synonyms, antonyms, and contextual examples.',
      icon: BookOpen,
      href: '/words',
      gradient: 'purple' as const,
    },
    {
      title: 'Play Quizzes',
      description: 'Test your knowledge with auto-generated quizzes including MCQs, matching tests, and fill-in-the-blanks.',
      icon: Brain,
      href: '/quiz',
      gradient: 'blue' as const,
    },
    {
      title: 'Flashcards',
      description: 'Master vocabulary with interactive flashcards. Swipe, shuffle, and track your progress effortlessly.',
      icon: Layers,
      href: '/flashcards',
      gradient: 'mixed' as const,
    },
  ];

  const stats = [
    { label: 'Words', value: words.length.toLocaleString(), icon: BookOpen },
    { label: 'Quiz Types', value: '4+', icon: Brain },
    { label: 'Languages', value: '2', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        
        <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                The Ultimate Vocabulary Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display leading-tight mb-6"
            >
              Master Every Word.{' '}
              <span className="gradient-text glow-text">Master Every Exam.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Build an unshakeable vocabulary with smart definitions, Bangla translations, 
              interactive quizzes, and personalized flashcards.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <SearchBar size="large" />
              <p className="text-xs text-muted-foreground mt-3">
                Press <kbd className="px-2 py-0.5 rounded bg-muted text-foreground font-mono">/</kbd> to search anywhere
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/words">
                <Button size="lg" className="h-12 px-8 rounded-xl bg-gradient-button hover:opacity-90 transition-opacity glow">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Words
                </Button>
              </Link>
              <Link to="/quiz">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-primary/30 hover:bg-primary/10">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center justify-center gap-8 md:gap-16 mt-16"
            >
              {stats.map(({ label, value, icon: Icon }, i) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-2xl md:text-3xl font-bold text-foreground">{value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Everything You Need to <span className="gradient-text">Excel</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our platform combines intelligent learning tools with beautiful design 
              to make vocabulary building enjoyable and effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Words Section */}
      {!loading && featuredWords.length > 0 && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-3xl font-bold font-display mb-2">
                  Featured Words
                </h2>
                <p className="text-muted-foreground">
                  Start your learning journey with these essential words
                </p>
              </div>
              <Link to="/words">
                <Button variant="outline" className="rounded-xl">
                  View All
                  <TrendingUp className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredWords.map((word, index) => (
                <WordCard key={word.id} word={word} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-8 md:p-12 rounded-3xl glass border border-primary/20 overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-accent opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Ready to <span className="gradient-text">Transform</span> Your Vocabulary?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of learners who are mastering new words every day. 
                Start with our comprehensive word library and personalized learning tools.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/words">
                  <Button size="lg" className="rounded-xl bg-gradient-button glow">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="ghost" className="rounded-xl">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} VocaForge. Built with ❤️ for vocabulary enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}

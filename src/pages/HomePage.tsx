import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  MousePointer, 
  Lightbulb, 
  Target, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Quote,
  GraduationCap,
  PenTool,
  Globe,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useWords } from '@/context/WordContext';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  const { words } = useWords();

  const features = [
    { icon: BookOpen, text: 'Learn words through Bangla & English passages' },
    { icon: MousePointer, text: 'Click any word to see meaning, usage, contrast, and pronunciation' },
    { icon: GraduationCap, text: 'Master grammar with chapter-wise lessons' },
    { icon: Brain, text: 'Practice with adaptive quizzes' },
    { icon: Target, text: 'Designed for reading, writing, and comprehension' },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Learn in Context',
      description: 'Words appear inside Bangla stories and English passages. Click any word to explore meaning, examples, synonyms, antonyms, and pronunciation.',
      icon: BookOpen
    },
    {
      step: 2,
      title: 'Click to Understand',
      description: 'See meaning, synonyms, antonyms, examples, and pronunciation. Every explanation focuses on why a word fits, not just what it means.',
      icon: MousePointer
    },
    {
      step: 3,
      title: 'Think Before You See',
      description: 'Meanings are explained using contextual logic, not just dictionary definitions. This encourages deeper understanding.',
      icon: Lightbulb
    },
    {
      step: 4,
      title: 'Practice Smartly',
      description: 'Smart quizzes adapt to your level and focus on understanding, not guessing. Strengthen long-term retention.',
      icon: Brain
    },
  ];

  const whoItsFor = [
    { icon: GraduationCap, text: 'Students preparing for any English exam' },
    { icon: Globe, text: 'Learners transitioning from Bangla to academic English' },
    { icon: PenTool, text: 'Writers aiming for clear and precise vocabulary' },
    { icon: Sparkles, text: 'Anyone who wants to actually understand words' },
  ];

  const coreFeatures = [
    'Context-based learning',
    'Bangla + English explanations',
    'Difficulty-based word levels',
    'Essential Grammar chapters',
    'Pronunciation (US & UK)',
    'Adaptive quizzes',
    'Exam-neutral academic focus',
  ];

  const faqs = [
    {
      question: 'What is ShobdoHub?',
      answer: 'ShobdoHub is a vocabulary learning platform focused on contextual understanding, not rote memorization. We help learners truly understand words so they can use them correctly.'
    },
    {
      question: 'Is ShobdoHub exam-specific?',
      answer: 'No. ShobdoHub is exam-neutral. It builds academic vocabulary useful for reading, writing, speaking, and comprehension across all English exams and real-world usage.'
    },
    {
      question: 'Are meanings available in Bangla?',
      answer: 'Yes. Words include Bangla explanations, English definitions, examples, synonyms, and antonyms.'
    },
    {
      question: 'Do I need to memorize word lists?',
      answer: 'No. Words are learned through stories, passages, and usage, which improves long-term retention.'
    },
    {
      question: 'Is ShobdoHub free?',
      answer: 'Core features are available for free. Some advanced features may be part of a premium plan.'
    },
    {
      question: 'Can beginners use ShobdoHub?',
      answer: 'Yes. Difficulty levels range from basic academic to advanced nuanced vocabulary.'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="section-spacing pt-24 md:pt-32">
        <div className="container-wide">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              Understand Words.{' '}
              <span className="text-primary">Use Them Right.</span>{' '}
              Everywhere.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Build deep, practical English vocabulary through context, stories, and real usage — not memorization.
            </p>

            <p className="text-muted-foreground mb-10">
              ShobdoHub helps learners truly understand words so they can read better, write clearly, and express ideas precisely across all English exams and academic contexts.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8">
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/words">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Explore Words
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why ShobdoHub Section */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-wide">
          <motion.div 
            className="text-center mb-12"
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Why ShobdoHub?
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
              >
                <feature.icon className="w-5 h-5 text-primary shrink-0" />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-spacing">
        <div className="container-wide">
          <motion.div 
            className="text-center mb-12"
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              How ShobdoHub Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-wide">
          <motion.div 
            className="text-center mb-12"
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Who It's For
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {whoItsFor.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border"
              >
                <item.icon className="w-5 h-5 text-primary shrink-0" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem We Solve Section */}
      <section className="section-spacing">
        <div className="container-narrow text-center">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Why Most Vocabulary Learning Fails
            </h2>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <XCircle className="w-5 h-5 text-destructive" />
                <span>Memorizing word lists</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <XCircle className="w-5 h-5 text-destructive" />
                <span>Forgetting meanings after exams</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <XCircle className="w-5 h-5 text-destructive" />
                <span>Knowing definitions but not usage</span>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-lg font-medium">
                Vocabulary isn't about knowing words.
              </p>
              <p className="text-lg text-primary font-semibold">
                It's about knowing when and how to use them.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-wide">
          <motion.div 
            className="text-center mb-12"
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Core Features
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 p-4 bg-card rounded-lg border border-border"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
            className="text-center"
          >
            <Quote className="w-10 h-10 text-primary/30 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl italic text-muted-foreground mb-6">
              "ShobdoHub focuses on how words actually work in sentences, not just what they mean."
            </blockquote>
            <p className="text-sm text-muted-foreground">
              — Early user feedback
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Stop Memorizing. Start Understanding.
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              No credit card required
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="secondary"
                className="h-12 px-8"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div 
            className="text-center mb-12"
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
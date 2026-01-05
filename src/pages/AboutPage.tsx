import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Brain, Target, Users, Heart } from 'lucide-react';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const philosophy = [
    'Words make sense only in context',
    'Meaning is shaped by tone, usage, and contrast',
    'True vocabulary mastery improves reading, writing, and thinking',
  ];

  const whoWeBuiltFor = [
    { icon: Users, text: 'Students preparing for English-based exams' },
    { icon: BookOpen, text: 'Learners transitioning from Bangla to academic English' },
    { icon: Target, text: 'Writers seeking precision and clarity' },
    { icon: Heart, text: 'Anyone who wants to truly understand language' },
  ];

  const whatMakesUsDifferent = [
    'Prioritizes context over definitions',
    'Explains why a word fits, not just what it means',
    'Connects Bangla thinking to English expression',
    'Focuses on long-term retention, not short-term recall',
  ];

  return (
    <div className="min-h-screen flex flex-col pt-14">
      {/* Hero */}
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">
              About ShobdoHub
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              ShobdoHub was created to solve a simple but widespread problem: students know many words, but struggle to use them correctly.
            </p>
            <p className="text-muted-foreground">
              Traditional vocabulary learning relies on memorization. ShobdoHub focuses on <span className="text-foreground font-medium">understanding</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              Our Philosophy
            </h2>
            <p className="text-center text-muted-foreground mb-8">We believe:</p>
            <div className="space-y-4 max-w-md mx-auto">
              {philosophy.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 bg-card rounded-lg border border-border text-center"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8">
              That's why ShobdoHub teaches words through Bangla stories, English passages, real usage, and thought-based explanations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Built This For */}
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              Who We Built This For
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {whoWeBuiltFor.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border"
                >
                  <item.icon className="w-5 h-5 text-primary shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8">
              We are exam-neutral by design, because strong vocabulary works everywhere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              What Makes Us Different
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Unlike typical vocabulary platforms, ShobdoHub:
            </p>
            <div className="space-y-3 max-w-md mx-auto">
              {whatMakesUsDifferent.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-spacing">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To help learners understand words deeply, so they can communicate clearly, confidently, and accurately in any academic or professional setting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Looking Ahead */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Looking Ahead
            </h2>
            <p className="text-muted-foreground mb-8">
              ShobdoHub is continuously evolving. We are committed to building tools that make language learning smarter, more human, and more effective.
            </p>
            <Link to="/auth">
              <Button size="lg">
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
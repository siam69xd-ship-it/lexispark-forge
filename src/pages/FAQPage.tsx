import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from '@/components/Footer';

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is ShobdoHub?',
      answer: 'ShobdoHub is a vocabulary learning platform focused on contextual understanding, not rote memorization. We help learners truly understand words so they can use them correctly in reading, writing, and speaking.'
    },
    {
      question: 'Is ShobdoHub exam-specific?',
      answer: 'No. ShobdoHub is exam-neutral. It builds academic vocabulary useful for reading, writing, speaking, and comprehension across all English exams and real-world usage. Whether you\'re preparing for IELTS, TOEFL, SAT, or any other exam, the vocabulary skills you develop here will apply universally.'
    },
    {
      question: 'Are meanings available in Bangla?',
      answer: 'Yes. Words include Bangla explanations alongside English definitions, examples, synonyms, and antonyms. This helps learners connect their native thinking to English expression.'
    },
    {
      question: 'Do I need to memorize word lists?',
      answer: 'No. Words are learned through stories, passages, and usage rather than isolated word lists. This contextual approach improves long-term retention and helps you understand when and how to use words correctly.'
    },
    {
      question: 'Is ShobdoHub free?',
      answer: 'Core features are available for free, including access to the word library, passages, and basic quizzes. Some advanced features may be part of a premium plan in the future.'
    },
    {
      question: 'Can beginners use ShobdoHub?',
      answer: 'Yes. Difficulty levels range from basic academic vocabulary to advanced nuanced words. The platform adapts to your level and helps you progress at your own pace.'
    },
    {
      question: 'How is ShobdoHub different from other vocabulary apps?',
      answer: 'Most vocabulary apps focus on memorization and simple definitions. ShobdoHub teaches words in context, explains why words fit in certain situations, and connects Bangla thinking to English expression. We focus on understanding, not just knowing.'
    },
    {
      question: 'Do I need to create an account?',
      answer: 'You can explore words without an account, but creating a free account allows you to track your progress, save words to your learning list, and access personalized quizzes.'
    },
    {
      question: 'How do the quizzes work?',
      answer: 'Our quizzes are adaptive and focus on understanding rather than guessing. They include multiple choice questions, matching exercises, and fill-in-the-blank activities based on the words you\'ve been learning.'
    },
    {
      question: 'Can I use ShobdoHub on mobile?',
      answer: 'Yes. ShobdoHub is fully responsive and works on all devices including phones, tablets, and computers.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach us at support@shobdohub.com for any questions, feedback, or issues.'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-14">
      <section className="section-spacing">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions about ShobdoHub.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
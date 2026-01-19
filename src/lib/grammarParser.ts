export interface GrammarSection {
  id: string;
  type: 'rule' | 'example' | 'shortcut' | 'note' | 'practice' | 'content';
  title: string;
  content: string;
  bengaliContent?: string;
  englishContent?: string;
}

export interface GrammarChapter {
  id: number;
  title: string;
  titleBengali: string;
  description: string;
  sections: GrammarSection[];
  rawContent: string;
}

const chapterTitles: Record<number, { en: string; bn: string; desc: string }> = {
  1: { en: 'Freehand Writing Basics', bn: 'ফ্রিহ্যান্ড রাইটিং ব্যাসিক', desc: 'Learn the fundamentals of constructing English sentences through Subject and Verb identification.' },
  2: { en: 'Subject-Verb Agreement', bn: 'Subject Verb Agreement', desc: 'Master the essential rules for matching subjects with their correct verb forms.' },
  3: { en: 'Relative Pronouns', bn: 'Relative Pronoun', desc: 'Understand how to use Who, Which, Whom, That, and What to connect sentences.' },
  4: { en: 'Passive Voice & Freehand Writing', bn: 'Passive Voice', desc: 'Learn to transform active sentences into passive voice for formal writing.' },
  5: { en: 'Active & Passive Voice Practice', bn: 'Active ও Passive Voice', desc: 'Practice voice transformation with real-world examples.' },
  6: { en: 'Real Life Usage (Part 1)', bn: 'রিয়েল লাইফ ইউজ', desc: 'Apply grammar rules to everyday practical situations.' },
  7: { en: 'Real Life Usage (Part 2)', bn: 'রিয়েল লাইফ ইউজ', desc: 'More practical applications of English grammar.' },
  8: { en: 'Real Life Usage (Part 3)', bn: 'রিয়েল লাইফ ইউজ', desc: 'Advanced real-life sentence construction techniques.' },
  9: { en: 'Real Life Usage (Part 4)', bn: 'রিয়েল লাইফ ইউজ', desc: 'Complex sentence patterns for daily communication.' },
  10: { en: 'Real Life Usage (Part 5)', bn: 'রিয়েল লাইফ ইউজ', desc: 'Birthday, celebrations, and special occasions vocabulary.' },
  11: { en: 'Real Life Usage (Part 6)', bn: 'রিয়েল লাইফ ইউজ', desc: 'Technology and mobile phone related expressions.' },
  12: { en: 'Physical Exercise & Health', bn: 'শরীরচর্চা', desc: 'Health, fitness, and exercise related grammar usage.' },
  13: { en: 'Science & Technology', bn: 'বিজ্ঞান ও প্রযুক্তি', desc: 'Scientific and technological vocabulary with grammar.' },
  14: { en: 'Traffic & Transportation', bn: 'ট্রাফিক সমস্যা', desc: 'Transportation and traffic related sentence patterns.' },
  15: { en: 'News & Media Writing', bn: 'সংবাদ ও মিডিয়া', desc: 'Formal writing style for news and media contexts.' },
  16: { en: 'Banking & Finance', bn: 'ব্যাংকিং', desc: 'Financial and banking terminology with proper grammar.' },
  17: { en: 'Environment & Pollution', bn: 'পরিবেশ দূষণ', desc: 'Environmental issues and vocabulary.' },
  18: { en: 'Education & Career', bn: 'শিক্ষা ও ক্যারিয়ার', desc: 'Academic and career-related expressions.' },
  19: { en: 'Business & Commerce', bn: 'ব্যবসা', desc: 'Business communication and commercial writing.' },
  20: { en: 'Government & Administration', bn: 'সরকার ও প্রশাসন', desc: 'Official and administrative language patterns.' },
  21: { en: 'Agriculture & Food', bn: 'কৃষি ও খাদ্য', desc: 'Agricultural and food-related vocabulary.' },
  22: { en: 'Sports & Games', bn: 'খেলাধুলা', desc: 'Sports terminology and expressions.' },
  23: { en: 'Culture & Tradition', bn: 'সংস্কৃতি', desc: 'Cultural and traditional expressions.' },
  24: { en: 'Travel & Tourism', bn: 'ভ্রমণ', desc: 'Travel and tourism vocabulary.' },
  25: { en: 'Important Grammar Rules', bn: 'গুরুত্বপূর্ণ গ্রামার রুল', desc: 'Essential grammar rules for competitive exams.' },
  26: { en: 'Modal Auxiliaries', bn: 'Modal Auxiliaries', desc: 'Complete guide to Can, Could, May, Might, Will, Would, Shall, Should, Must.' },
  27: { en: 'Prepositions', bn: 'Preposition', desc: 'Mastering preposition usage in English.' },
  28: { en: 'Articles (A, An, The)', bn: 'Article', desc: 'Correct usage of definite and indefinite articles.' },
  29: { en: 'Conditional Sentences', bn: 'Conditional Sentence', desc: 'If-clauses and conditional structures.' },
  30: { en: 'Transformation of Sentences', bn: 'Sentence Transformation', desc: 'Converting sentences between different forms.' },
  31: { en: 'Narration (Direct & Indirect)', bn: 'Narration', desc: 'Converting direct speech to indirect speech.' },
  32: { en: 'Right Forms of Verbs', bn: 'Right Form of Verb', desc: 'Selecting correct verb forms in context.' },
  33: { en: 'Common Errors', bn: 'Common Errors', desc: 'Avoiding common grammatical mistakes.' },
  34: { en: 'Idioms & Phrases', bn: 'Idioms & Phrases', desc: 'Essential idioms and phrases for fluent English.' },
  35: { en: 'One Word Substitution', bn: 'One Word Substitution', desc: 'Replacing phrases with single words.' },
  36: { en: 'Synonyms & Antonyms', bn: 'Synonyms & Antonyms', desc: 'Building vocabulary through word relationships.' },
  37: { en: 'Spelling Rules', bn: 'Spelling', desc: 'English spelling rules and exceptions.' },
  38: { en: 'Punctuation', bn: 'Punctuation', desc: 'Correct use of punctuation marks.' },
  39: { en: 'Sentence Structure', bn: 'Sentence Structure', desc: 'Understanding sentence components and patterns.' },
  40: { en: 'Parts of Speech', bn: 'Parts of Speech', desc: 'Nouns, verbs, adjectives, adverbs, and more.' },
  41: { en: 'Tenses', bn: 'Tense', desc: 'Complete guide to all tenses in English.' },
  42: { en: 'Voice (Active & Passive)', bn: 'Voice', desc: 'Understanding and using active and passive voice.' },
  43: { en: 'Question Tags', bn: 'Question Tag', desc: 'Forming correct question tags.' },
  44: { en: 'Modifiers', bn: 'Modifier', desc: 'Using adjectives and adverbs correctly.' },
  45: { en: 'Connectors & Linkers', bn: 'Connector', desc: 'Connecting ideas with appropriate transitions.' },
};

export function parseGrammarContent(content: string): GrammarChapter[] {
  const chapters: GrammarChapter[] = [];
  
  // Split content by chapter markers
  const chapterPattern = /Chapter-(\d+)/g;
  const parts = content.split(/(?=Chapter-\d+)/);
  
  parts.forEach((part) => {
    if (!part.trim()) return;
    
    const chapterMatch = part.match(/Chapter-(\d+)/);
    if (!chapterMatch) return;
    
    const chapterId = parseInt(chapterMatch[1]);
    const chapterInfo = chapterTitles[chapterId] || { 
      en: `Chapter ${chapterId}`, 
      bn: `অধ্যায় ${chapterId}`,
      desc: 'Grammar concepts and practical examples.'
    };
    
    // Extract raw content after chapter marker
    const rawContent = part.replace(/Chapter-\d+/, '').trim();
    
    // Parse sections from content
    const sections: GrammarSection[] = [];
    
    // Extract Rules
    const rulePattern = /Rule-\s*(\d+[a-z]?)([^R]*?)(?=Rule-|Shortcut|Chapter-|$)/gi;
    let ruleMatch;
    let ruleIndex = 0;
    while ((ruleMatch = rulePattern.exec(rawContent)) !== null) {
      ruleIndex++;
      const ruleNum = ruleMatch[1];
      const ruleContent = ruleMatch[2].trim();
      
      // Separate Bengali and English content
      const englishMatch = ruleContent.match(/Example[s]?:?\s*([\s\S]*?)(?=\d+[A-Z]|$)/i);
      
      sections.push({
        id: `rule-${chapterId}-${ruleNum}`,
        type: 'rule',
        title: `Rule ${ruleNum}`,
        content: ruleContent,
        englishContent: englishMatch ? englishMatch[1].trim() : undefined
      });
    }
    
    // Extract Shortcut Tips
    const shortcutPattern = /Shortcut Tips?-\s*(\d+)([^S]*?)(?=Shortcut|Chapter-|Rule-|$)/gi;
    let shortcutMatch;
    while ((shortcutMatch = shortcutPattern.exec(rawContent)) !== null) {
      sections.push({
        id: `shortcut-${chapterId}-${shortcutMatch[1]}`,
        type: 'shortcut',
        title: `Shortcut Tips ${shortcutMatch[1]}`,
        content: shortcutMatch[2].trim()
      });
    }
    
    // If no rules found, add the entire content as a section
    if (sections.length === 0 && rawContent.length > 50) {
      // Split by numbered items
      const numberedPattern = /(\d+)([^\d]+?)(?=\d+[A-Za-z\u0980-\u09FF]|$)/g;
      let numberedMatch;
      let contentIndex = 0;
      
      while ((numberedMatch = numberedPattern.exec(rawContent)) !== null && contentIndex < 50) {
        contentIndex++;
        const itemContent = numberedMatch[2].trim();
        if (itemContent.length > 20) {
          sections.push({
            id: `content-${chapterId}-${contentIndex}`,
            type: 'content',
            title: `Section ${contentIndex}`,
            content: itemContent
          });
        }
      }
      
      // If still no sections, add as single content block
      if (sections.length === 0) {
        sections.push({
          id: `content-${chapterId}-main`,
          type: 'content',
          title: 'Chapter Content',
          content: rawContent.slice(0, 5000) // Limit for display
        });
      }
    }
    
    chapters.push({
      id: chapterId,
      title: chapterInfo.en,
      titleBengali: chapterInfo.bn,
      description: chapterInfo.desc,
      sections,
      rawContent: rawContent
    });
  });
  
  return chapters.sort((a, b) => a.id - b.id);
}

// Helper to format content for display
export function formatGrammarContent(content: string): string {
  // Add line breaks for readability
  return content
    .replace(/([।.!?])(\s*)([A-Z\u0980-\u09FF])/g, '$1\n\n$3')
    .replace(/Example[s]?:?\s*/gi, '\n\n**Example:** ')
    .replace(/Note:?\s*/gi, '\n\n**Note:** ')
    .replace(/(\d+\.\s)/g, '\n$1')
    .trim();
}

// Extract bilingual pairs from content
export function extractBilingualPairs(content: string): Array<{bengali: string; english: string}> {
  const pairs: Array<{bengali: string; english: string}> = [];
  
  // Pattern to find Bengali followed by English translation
  const pattern = /([\u0980-\u09FF][^\n]+?)[\s-–—]+([A-Z][^।\n]+\.?)/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    if (match[1].length > 10 && match[2].length > 10) {
      pairs.push({
        bengali: match[1].trim(),
        english: match[2].trim()
      });
    }
  }
  
  return pairs;
}

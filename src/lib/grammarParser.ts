export interface GrammarRule {
  id: string;
  title: string;
  content: string;
  examples: string[];
}

export interface GrammarChapter {
  id: number;
  title: string;
  description: string;
  rules: GrammarRule[];
  content: string[];
  examples: { bengali: string; english: string }[];
}

export function parseGrammarContent(content: string): GrammarChapter[] {
  const chapters: GrammarChapter[] = [];
  
  // Split by chapter markers
  const chapterPattern = /Chapter-(\d+)([^\n]+)/g;
  const lines = content.split(/(?=Chapter-\d+)/);
  
  lines.forEach((chapterBlock) => {
    if (!chapterBlock.trim()) return;
    
    const chapterMatch = chapterBlock.match(/Chapter-(\d+)([^\d]+)/);
    if (!chapterMatch) return;
    
    const chapterId = parseInt(chapterMatch[1]);
    const titlePart = chapterMatch[2]?.trim() || '';
    
    // Extract chapter title (first meaningful text after chapter number)
    const titleMatch = titlePart.match(/^([A-Za-z\s&]+)/);
    const chapterTitle = titleMatch ? titleMatch[1].trim() : extractBengaliTitle(titlePart);
    
    // Parse rules within chapter
    const rules: GrammarRule[] = [];
    const rulePattern = /Rule-\s*(\d+)([^R]+?)(?=Rule-|\+\d|Shortcut|Chapter-|$)/gi;
    let ruleMatch;
    
    while ((ruleMatch = rulePattern.exec(chapterBlock)) !== null) {
      const ruleId = ruleMatch[1];
      const ruleContent = ruleMatch[2].trim();
      
      // Extract examples from rule content
      const examplePattern = /Example[s]?[:\s]*([^R]+?)(?=Rule-|$)/gi;
      const examples: string[] = [];
      let exMatch;
      while ((exMatch = examplePattern.exec(ruleContent)) !== null) {
        examples.push(exMatch[1].trim());
      }
      
      rules.push({
        id: `rule-${chapterId}-${ruleId}`,
        title: `Rule ${ruleId}`,
        content: ruleContent.split('Example')[0]?.trim() || ruleContent,
        examples
      });
    }
    
    // Extract shortcut tips
    const shortcutPattern = /Shortcut Tips-\s*(\d+)([^S]+?)(?=Shortcut|Chapter-|$)/gi;
    let shortcutMatch;
    while ((shortcutMatch = shortcutPattern.exec(chapterBlock)) !== null) {
      rules.push({
        id: `shortcut-${chapterId}-${shortcutMatch[1]}`,
        title: `Shortcut Tips ${shortcutMatch[1]}`,
        content: shortcutMatch[2].trim(),
        examples: []
      });
    }
    
    // Extract translation examples
    const examples: { bengali: string; english: string }[] = [];
    const translationPattern = /(\p{Script=Bengali}[^\n]+)\n([A-Z][^।]+\.)/gu;
    let transMatch;
    while ((transMatch = translationPattern.exec(chapterBlock)) !== null) {
      examples.push({
        bengali: transMatch[1].trim(),
        english: transMatch[2].trim()
      });
    }
    
    // Get content paragraphs
    const contentLines = chapterBlock
      .replace(/Chapter-\d+/, '')
      .split(/\d+(?=[A-Z\u0980-\u09FF])/)
      .filter(line => line.trim().length > 20)
      .slice(0, 5);
    
    chapters.push({
      id: chapterId,
      title: getChapterTitle(chapterId, chapterTitle),
      description: getChapterDescription(chapterId),
      rules,
      content: contentLines,
      examples
    });
  });
  
  return chapters.sort((a, b) => a.id - b.id);
}

function extractBengaliTitle(text: string): string {
  const match = text.match(/[\u0980-\u09FF\s]+/);
  return match ? match[0].trim().slice(0, 50) : 'Grammar Lesson';
}

function getChapterTitle(id: number, fallback: string): string {
  const titles: Record<number, string> = {
    1: 'Freehand Writing Basics',
    2: 'Subject-Verb Agreement',
    3: 'Relative Pronouns',
    4: 'Passive Voice',
    5: 'Tense & Voice',
    6: 'Modifiers & Articles',
    7: 'Sentence Connectors',
    8: 'Conditional Sentences',
    9: 'Reported Speech',
    10: 'Common Errors',
    11: 'Causative Verbs',
    12: 'Parallel Structure',
    13: 'Question Tags',
    14: 'Inversion',
    15: 'Right Forms of Verbs'
  };
  return titles[id] || fallback || `Chapter ${id}`;
}

function getChapterDescription(id: number): string {
  const descriptions: Record<number, string> = {
    1: 'Learn the fundamentals of constructing English sentences through Subject and Verb identification.',
    2: 'Master the essential rules for matching subjects with their correct verb forms.',
    3: 'Understand how to use Who, Which, Whom, That, and What to connect sentences.',
    4: 'Learn to transform active sentences into passive voice for formal writing.',
    5: 'Practice tense transformations and voice changes in various contexts.',
    6: 'Use modifiers and articles correctly to enhance sentence precision.',
    7: 'Connect ideas smoothly using transition words and conjunctions.',
    8: 'Master If-clauses and conditional sentence structures.',
    9: 'Convert direct speech to indirect speech accurately.',
    10: 'Identify and correct common grammatical mistakes.',
    11: 'Learn causative verb patterns for expressing actions done by others.',
    12: 'Maintain parallel structure in lists and comparisons.',
    13: 'Form correct question tags for confirmation questions.',
    14: 'Use inversion for emphasis and formal expression.',
    15: 'Select the correct verb forms in various grammatical contexts.'
  };
  return descriptions[id] || 'Essential grammar concepts for effective English writing.';
}

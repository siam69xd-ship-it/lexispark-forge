export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  smartMeaning: string;
  banglaMeaning: string;
  detailedBanglaMeaning: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  firstLetter: string;
}

// Comprehensive Bangla text fixing
function fixBanglaText(text: string): string {
  if (!text) return '';
  
  let fixed = text;
  
  // Remove the malformed prefix pattern completely
  fixed = fixed.replace(/ব\s*া\s*া?ং?ল\s*া\s*অ\s*র্\s*থঃ?\s*/gi, '');
  
  // String replacements for broken conjuncts
  const stringFixes: [string, string][] = [
    ['ঝে', 'বে'],
    ['ঝি', 'বি'],  
    ['ঝা', 'বা'],
    ['ঝু', 'বু'],
    ['ঝো', 'বো'],
    ['ঝ্য', 'ব্য'],
    ['ঝ্র', 'ব্র'],
  ];
  
  for (const [from, to] of stringFixes) {
    fixed = fixed.split(from).join(to);
  }
  
  // Regex replacements
  fixed = fixed.replace(/্\s+/g, '্');
  fixed = fixed.replace(/\s+্/g, '্');
  fixed = fixed.replace(/্্+/g, '্');
  fixed = fixed.replace(/ে\s*া/g, 'ো');
  fixed = fixed.replace(/ে\s*ৌ/g, 'ৌ');
  fixed = fixed.replace(/িি+/g, 'ি');
  fixed = fixed.replace(/াা+/g, 'া');
  fixed = fixed.replace(/ীী+/g, 'ী');
  fixed = fixed.replace(/ুুু+/g, 'ু');
  fixed = fixed.replace(/ূূ+/g, 'ূ');
  fixed = fixed.replace(/\s+[;,।]/g, (m) => m.trim());
  fixed = fixed.replace(/[;,।]\s+/g, (m) => m.charAt(0) + ' ');
  fixed = fixed.replace(/\s{2,}/g, ' ');
  
  // Aggressive space removal between adjacent Bangla chars
  for (let i = 0; i < 10; i++) {
    const before = fixed;
    fixed = fixed.replace(/([\u0980-\u09FF])\s([\u0980-\u09FF])/g, '$1$2');
    if (before === fixed) break;
  }
  
  // Clean technical markers
  fixed = fixed.replace(/\[Uncountable noun\]/gi, '');
  fixed = fixed.replace(/\[Countable noun\]/gi, '');
  fixed = fixed.replace(/\(verb transitive\)/gi, '(ক্রিয়া)');
  fixed = fixed.replace(/\(verb intransitive\)/gi, '(অকর্মক ক্রিয়া)');
  fixed = fixed.replace(/\(adjective\)/gi, '(বিশেষণ)');
  fixed = fixed.replace(/\(noun\)/gi, '(বিশেষ্য)');
  fixed = fixed.replace(/\(adverb\)/gi, '(ক্রিয়া বিশেষণ)');
  
  // Final cleanup
  fixed = fixed.replace(/^[,;\s।০-৯\[\]]+/, '');
  fixed = fixed.replace(/[,;\s।]+$/, '');
  
  return fixed.trim();
}

export function parseWordsFromText(text: string): Word[] {
  const words: Word[] = [];
  const blocks = text.split(/🎯\s*/);

  for (const block of blocks) {
    if (!block.trim()) continue;

    try {
      const word = parseWordBlock(block);
      if (word) {
        words.push(word);
      }
    } catch (e) {
      console.warn('Failed to parse block:', e);
    }
  }

  return words;
}

function parseWordBlock(block: string): Word | null {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;

  // First line: word and pronunciation
  const firstLine = lines[0];
  const wordMatch = firstLine.match(/^([A-Z]+)\s*➺?\s*\(([^)]+)\)\s*\[([^\]]+)\]/i);
  
  let wordText = '';
  let pronunciation = '';
  
  if (wordMatch) {
    wordText = wordMatch[1].trim();
    pronunciation = wordMatch[2].trim();
  } else {
    const simpleMatch = firstLine.match(/^([A-Z]+)/i);
    if (simpleMatch) {
      wordText = simpleMatch[1].trim();
    } else {
      return null;
    }
  }

  // Extract Bangla meaning (lines 1-5, looking for Bangla content)
  const banglaMeaningParts: string[] = [];
  for (let i = 1; i < Math.min(lines.length, 8); i++) {
    const line = lines[i];
    
    // Skip if it's an English section header
    if (line.includes('Word Smart') || line.includes('Synonym') || 
        line.includes('Antonym') || line.includes('Detailed') ||
        line.includes('Example') || line.startsWith('❑')) {
      break;
    }
    
    // Check if line has Bangla characters
    if (/[\u0980-\u09FF]/.test(line)) {
      const cleaned = fixBanglaText(line);
      if (cleaned && cleaned.length > 2) {
        banglaMeaningParts.push(cleaned);
      }
    }
  }
  
  const banglaMeaning = banglaMeaningParts.join(', ');

  // Extract Smart Meaning
  const smartMeaningLine = lines.find(l => l.includes('Word Smart Meaning'));
  let smartMeaning = '';
  if (smartMeaningLine) {
    smartMeaning = smartMeaningLine
      .replace(/Word Smart Meaning:?➭?\s*/i, '')
      .replace(/^[vnaj]+\s+/i, '')
      .trim();
  }

  // Part of speech
  const posMatch = smartMeaningLine?.match(/➭?\s*(v|n|adj|adv)\s+/i);
  const partOfSpeech = posMatch ? getFullPartOfSpeech(posMatch[1]) : 'noun';

  // Synonyms (English only)
  const synonymLine = lines.find(l => l.toLowerCase().startsWith('synonym'));
  const synonyms = synonymLine 
    ? synonymLine
        .replace(/synonyms?:?-?\s*/i, '')
        .split(/[,;]/)
        .map(s => s.trim())
        .filter(s => s && s.length > 1 && /^[a-zA-Z\s\-\/()]+$/.test(s))
    : [];

  // Antonyms (English only)
  const antonymLine = lines.find(l => l.toLowerCase().startsWith('antonym'));
  const antonyms = antonymLine 
    ? antonymLine
        .replace(/antonyms?:?-?\s*/i, '')
        .split(/[,;]/)
        .map(s => s.trim())
        .filter(s => s && s.length > 1 && /^[a-zA-Z\s\-\/()]+$/.test(s))
    : [];

  // Detailed Bangla meaning
  const detailedIndex = lines.findIndex(l => l.includes('Detailed Bangla Meaning'));
  let detailedBanglaMeaning = '';
  if (detailedIndex > -1) {
    const detailedParts: string[] = [];
    for (let i = detailedIndex + 1; i < lines.length && i < detailedIndex + 20; i++) {
      const line = lines[i];
      
      // Stop at next section
      if (line.toLowerCase().startsWith('example') || 
          line.toLowerCase().startsWith('synonym') ||
          line.includes('📚') || line.includes('🎯') ||
          line.includes('http://')) {
        break;
      }
      
      // Process Bangla content
      if (/[\u0980-\u09FF]/.test(line) || line.startsWith('🗹') || line.startsWith('❑')) {
        const cleaned = fixBanglaText(line.replace(/^[🗹❑\d\s।]+/, ''));
        if (cleaned && cleaned.length > 3) {
          detailedParts.push(cleaned);
        }
      }
    }
    detailedBanglaMeaning = detailedParts.join(' ');
  }

  // Examples (English sentences only)
  const examples: string[] = [];
  const exampleIndex = lines.findIndex(l => l.toLowerCase().startsWith('example'));
  
  // From Examples section
  if (exampleIndex > -1) {
    for (let i = exampleIndex + 1; i < lines.length && examples.length < 10; i++) {
      const line = lines[i];
      if (line.includes('📚') || line.includes('🎯') || line.includes('http')) break;
      
      if (line.startsWith('❑')) {
        const example = line.replace(/^❑\s*/, '').trim();
        const banglaRatio = (example.match(/[\u0980-\u09FF]/g) || []).length / example.length;
        
        if (example.length > 15 && example.length < 500 && 
            /^[A-Z]/.test(example) && banglaRatio < 0.15) {
          examples.push(example);
        }
      }
    }
  }
  
  // Also from definition area
  const stopIndex = exampleIndex > -1 ? exampleIndex : lines.findIndex(l => l.includes('Detailed'));
  for (let i = 5; i < (stopIndex > -1 ? stopIndex : lines.length) && examples.length < 10; i++) {
    const line = lines[i];
    if (line.startsWith('❑')) {
      const example = line.replace(/^❑\s*/, '').trim();
      const banglaRatio = (example.match(/[\u0980-\u09FF]/g) || []).length / example.length;
      
      if (example.length > 20 && example.length < 500 && 
          /^[A-Z]/.test(example) && banglaRatio < 0.15 && !examples.includes(example)) {
        examples.push(example);
      }
    }
  }

  // Difficulty
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (wordText.length <= 5 && synonyms.length > 5) difficulty = 'easy';
  else if (wordText.length > 8 || synonyms.length < 3) difficulty = 'hard';

  return {
    id: wordText.toLowerCase().replace(/[^a-z]/g, ''),
    word: wordText.toUpperCase(),
    pronunciation,
    partOfSpeech,
    smartMeaning,
    banglaMeaning,
    detailedBanglaMeaning,
    synonyms: synonyms.slice(0, 15),
    antonyms: antonyms.slice(0, 15),
    examples: examples.slice(0, 8),
    difficulty,
    firstLetter: wordText[0]?.toUpperCase() || 'A',
  };
}

function getFullPartOfSpeech(abbr: string): string {
  const map: Record<string, string> = {
    v: 'verb',
    n: 'noun',
    adj: 'adjective',
    adv: 'adverb',
    prep: 'preposition',
    conj: 'conjunction',
    interj: 'interjection',
  };
  return map[abbr.toLowerCase()] || 'noun';
}

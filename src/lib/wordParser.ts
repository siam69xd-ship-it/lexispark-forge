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

// Clean up Bangla text by removing excess spaces between characters
function cleanBanglaText(text: string): string {
  if (!text) return '';
  
  // Remove the "বা াংল া  অ র্ থঃ" prefix pattern
  let cleaned = text.replace(/^ব\s*া\s*া?ং?ল\s*া\s*অ\s*র্\s*থঃ?\s*/gi, '');
  
  // Remove excess spaces between Bangla characters
  // Match Bangla character followed by spaces followed by another Bangla character
  cleaned = cleaned.replace(/([\u0980-\u09FF])\s+([\u0980-\u09FF])/g, '$1$2');
  // Run multiple times to catch all cases
  cleaned = cleaned.replace(/([\u0980-\u09FF])\s+([\u0980-\u09FF])/g, '$1$2');
  cleaned = cleaned.replace(/([\u0980-\u09FF])\s+([\u0980-\u09FF])/g, '$1$2');
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  
  // Remove standalone punctuation/symbols at start
  cleaned = cleaned.replace(/^[,;:\s]+/, '');
  
  return cleaned;
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

  // First line contains word and pronunciation
  const firstLine = lines[0];
  const wordMatch = firstLine.match(/^([A-Z]+)\s*➺?\s*\(([^)]+)\)\s*\[([^\]]+)\]/i);
  
  let wordText = '';
  let pronunciation = '';
  
  if (wordMatch) {
    wordText = wordMatch[1].trim();
    pronunciation = wordMatch[2].trim();
  } else {
    // Try simpler pattern
    const simpleMatch = firstLine.match(/^([A-Z]+)/i);
    if (simpleMatch) {
      wordText = simpleMatch[1].trim();
    } else {
      return null;
    }
  }

  // Find lines with Bangla অর্থ pattern
  const banglaMeaningLines: string[] = [];
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    // Match lines that start with the broken "বা াংল া  অ র্ থঃ" pattern
    if (line.match(/^ব\s*া\s*া?ং?ল\s*া\s*অ\s*র্\s*থঃ?/i) || 
        (i > 0 && i < 5 && /^[\u0980-\u09FF]/.test(line) && !line.includes('Word Smart'))) {
      banglaMeaningLines.push(line);
    }
  }
  
  // Clean and join Bangla meaning
  let banglaMeaning = banglaMeaningLines.map(cleanBanglaText).filter(Boolean).join(', ');
  if (!banglaMeaning) {
    banglaMeaning = '';
  }

  // Extract Smart Meaning
  const smartMeaningLine = lines.find(l => l.includes('Word Smart Meaning') || l.includes('➭'));
  let smartMeaning = smartMeaningLine?.replace(/Word Smart Meaning:?➭?\s*/i, '').trim() || '';

  // Extract part of speech from smart meaning
  const posMatch = smartMeaning.match(/^(v|n|adj|adv|prep|conj|interj)\s+/i);
  const partOfSpeech = posMatch ? getFullPartOfSpeech(posMatch[1]) : 'noun';
  
  // Remove POS from meaning
  smartMeaning = smartMeaning.replace(/^(v|n|adj|adv|prep|conj|interj)\s+/i, '').trim();

  // Extract synonyms
  const synonymLine = lines.find(l => l.toLowerCase().startsWith('synonym'));
  const synonyms = synonymLine 
    ? synonymLine.replace(/synonyms?:?-?\s*/i, '').split(/[,;]/).map(s => s.trim()).filter(s => s && s.length > 1)
    : [];

  // Extract antonyms
  const antonymLine = lines.find(l => l.toLowerCase().startsWith('antonym'));
  const antonyms = antonymLine 
    ? antonymLine.replace(/antonyms?:?-?\s*/i, '').split(/[,;]/).map(s => s.trim()).filter(s => s && s.length > 1)
    : [];

  // Extract detailed Bangla meaning
  const detailedIndex = lines.findIndex(l => l.includes('Detailed Bangla Meaning'));
  let detailedBanglaMeaning = '';
  if (detailedIndex > -1) {
    const detailedLines: string[] = [];
    for (let i = detailedIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Examples') || line.toLowerCase().startsWith('synonym') || line.toLowerCase().startsWith('antonym')) break;
      if (/[\u0980-\u09FF]/.test(line) || line.startsWith('❑') || line.startsWith('🗹')) {
        const cleaned = cleanBanglaText(line.replace(/^[🗹❑\s]+/, ''));
        if (cleaned) detailedLines.push(cleaned);
      }
    }
    detailedBanglaMeaning = detailedLines.join(' ').trim();
  }

  // Extract examples - look for lines starting with ❑ after "Examples" section
  const examples: string[] = [];
  const exampleSectionIndex = lines.findIndex(l => l.toLowerCase().includes('examples'));
  
  if (exampleSectionIndex > -1) {
    for (let i = exampleSectionIndex + 1; i < lines.length && examples.length < 8; i++) {
      const line = lines[i];
      if (line.startsWith('❑')) {
        const example = line.replace(/^❑\s*/, '').trim();
        if (example.length > 15 && example.length < 400 && /^[A-Z]/.test(example)) {
          examples.push(example);
        }
      }
    }
  }
  
  // Also collect examples from before the Examples section (in the definition area)
  for (let i = 0; i < (exampleSectionIndex > -1 ? exampleSectionIndex : lines.length) && examples.length < 8; i++) {
    const line = lines[i];
    if (line.startsWith('❑')) {
      const example = line.replace(/^❑\s*/, '').trim();
      // Only add if it looks like an English sentence and isn't already added
      if (example.length > 20 && example.length < 400 && /^[A-Z]/.test(example) && !examples.includes(example)) {
        // Skip if it contains mostly Bangla
        const banglaCharCount = (example.match(/[\u0980-\u09FF]/g) || []).length;
        if (banglaCharCount < example.length * 0.3) {
          examples.push(example);
        }
      }
    }
  }

  // Determine difficulty based on word length and synonym count
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (wordText.length <= 5 && synonyms.length > 5) {
    difficulty = 'easy';
  } else if (wordText.length > 8 || synonyms.length < 3) {
    difficulty = 'hard';
  }

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

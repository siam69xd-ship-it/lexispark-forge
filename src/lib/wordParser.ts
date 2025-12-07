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

// Store for properly encoded Bangla meanings
let banglaMap: Map<string, string> = new Map();

export function setBanglaMap(map: Map<string, string>) {
  banglaMap = map;
}

export function parseBanglaFile(text: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = text.trim().split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 2) {
      const word = parts[0].toUpperCase();
      const bangla = parts[1];
      map.set(word, bangla);
    }
  }
  
  return map;
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

  // Get properly encoded Bangla from the map
  const banglaMeaning = banglaMap.get(wordText.toUpperCase()) || '';

  // Extract Smart Meaning (English definition)
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
  
  // Also from definition area (sentences marked with ❑)
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

  // Difficulty based on word length and synonyms count
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
    detailedBanglaMeaning: '',
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

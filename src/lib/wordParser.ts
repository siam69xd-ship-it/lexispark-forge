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

  // Extract Bangla meaning (lines starting with বা or containing Bengali)
  const banglaMeaningLines = lines.filter(l => 
    l.includes('বা') || l.includes('অর্থ') || /[\u0980-\u09FF]{3,}/.test(l)
  );
  const banglaMeaning = banglaMeaningLines.slice(0, 2).join(' ').replace(/^[বা াংল অর্থঃ\s:]+/g, '').trim();

  // Extract Smart Meaning
  const smartMeaningLine = lines.find(l => l.includes('Word Smart Meaning') || l.includes('➭'));
  const smartMeaning = smartMeaningLine?.replace(/Word Smart Meaning:?➭?\s*/i, '').trim() || '';

  // Extract part of speech from smart meaning
  const posMatch = smartMeaning.match(/^(v|n|adj|adv|prep|conj|interj)/i);
  const partOfSpeech = posMatch ? getFullPartOfSpeech(posMatch[1]) : 'noun';

  // Extract synonyms
  const synonymLine = lines.find(l => l.toLowerCase().includes('synonym'));
  const synonyms = synonymLine 
    ? synonymLine.replace(/synonyms?:?-?\s*/i, '').split(/[,;]/).map(s => s.trim()).filter(Boolean)
    : [];

  // Extract antonyms
  const antonymLine = lines.find(l => l.toLowerCase().includes('antonym'));
  const antonyms = antonymLine 
    ? antonymLine.replace(/antonyms?:?-?\s*/i, '').split(/[,;]/).map(s => s.trim()).filter(Boolean)
    : [];

  // Extract examples
  const examples: string[] = [];
  const exampleSection = lines.findIndex(l => l.toLowerCase().includes('examples'));
  if (exampleSection > -1) {
    for (let i = exampleSection + 1; i < lines.length && i < exampleSection + 10; i++) {
      const line = lines[i];
      if (line.startsWith('❑') || line.match(/^[A-Z]/)) {
        examples.push(line.replace(/^❑\s*/, '').trim());
      }
    }
  }
  
  // Also get examples from main content (lines starting with ❑)
  lines.forEach(line => {
    if (line.startsWith('❑') && !examples.includes(line.replace(/^❑\s*/, '').trim())) {
      const example = line.replace(/^❑\s*/, '').trim();
      if (example.length > 20 && example.length < 300) {
        examples.push(example);
      }
    }
  });

  // Extract detailed Bangla meaning
  const detailedIndex = lines.findIndex(l => l.includes('Detailed Bangla Meaning'));
  let detailedBanglaMeaning = '';
  if (detailedIndex > -1) {
    const detailedLines: string[] = [];
    for (let i = detailedIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Examples') || line.includes('Synonym') || line.includes('Antonym')) break;
      if (/[\u0980-\u09FF]/.test(line) || line.startsWith('❑')) {
        detailedLines.push(line.replace(/^[🗹❑\s]+/, ''));
      }
    }
    detailedBanglaMeaning = detailedLines.join(' ').trim();
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
    smartMeaning: smartMeaning.replace(/^(v|n|adj|adv)\s+/i, '').trim(),
    banglaMeaning: banglaMeaning || 'অর্থ পাওয়া যায়নি',
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

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
  const lines = text.trim().split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const word = parseSimpleLine(line);
      if (word) {
        words.push(word);
      }
    } catch (e) {
      console.warn('Failed to parse line:', e);
    }
  }

  return words;
}

function parseSimpleLine(line: string): Word | null {
  // Format: WORD | বাংলা অর্থ
  const parts = line.split('|').map(p => p.trim());
  
  if (parts.length < 2) return null;
  
  const wordText = parts[0].trim();
  const banglaMeaning = parts[1].trim();
  
  if (!wordText || !banglaMeaning) return null;
  
  // Determine difficulty based on word length
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (wordText.length <= 5) difficulty = 'easy';
  else if (wordText.length > 8) difficulty = 'hard';

  return {
    id: wordText.toLowerCase().replace(/[^a-z]/g, ''),
    word: wordText.toUpperCase(),
    pronunciation: '',
    partOfSpeech: 'noun',
    smartMeaning: '',
    banglaMeaning,
    detailedBanglaMeaning: '',
    synonyms: [],
    antonyms: [],
    examples: [],
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

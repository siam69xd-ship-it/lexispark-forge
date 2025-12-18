export interface Passage {
  id: number;
  title: string;
  words: string[];
  banglaText: string;
  englishText: string;
}

export function parsePassages(text: string): Passage[] {
  const passages: Passage[] = [];
  
  // Split by "Passage X:" pattern
  const passageBlocks = text.split(/(?=Passage \d+:)/);
  
  for (const block of passageBlocks) {
    if (!block.trim()) continue;
    
    try {
      const passage = parsePassageBlock(block);
      if (passage) {
        passages.push(passage);
      }
    } catch (e) {
      console.warn('Failed to parse passage block:', e);
    }
  }
  
  return passages;
}

function parsePassageBlock(block: string): Passage | null {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 4) return null;
  
  // Extract passage number and title
  const titleMatch = lines[0].match(/Passage (\d+):\s*(.+)/);
  if (!titleMatch) return null;
  
  const id = parseInt(titleMatch[1]);
  const title = titleMatch[2].trim();
  
  // Extract words from the (Words: ...) line
  const wordsLine = lines.find(l => l.includes('(Words:') || l.includes('​(Words:'));
  const words: string[] = [];
  if (wordsLine) {
    const wordsMatch = wordsLine.match(/\(Words:\s*([^)]+)\)/);
    if (wordsMatch) {
      words.push(...wordsMatch[1].split(',').map(w => w.trim().toUpperCase()));
    }
  }
  
  // Find Bengali and English sections
  let banglaText = '';
  let englishText = '';
  
  const banglaIndex = lines.findIndex(l => 
    l.includes('Bengali Contextual Version') || l.includes('​Bengali Contextual Version')
  );
  const englishIndex = lines.findIndex(l => 
    l.includes('English Translation') || l.includes('​English Translation')
  );
  
  if (banglaIndex !== -1 && englishIndex !== -1) {
    // Get Bangla text (lines between Bengali header and English header)
    for (let i = banglaIndex + 1; i < englishIndex; i++) {
      const line = lines[i];
      if (!line.includes('(Words:') && !line.includes('​(Words:')) {
        banglaText += (banglaText ? ' ' : '') + line;
      }
    }
    
    // Get English text (lines after English header until next passage or end)
    for (let i = englishIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('Passage ') || line.includes('Bengali Contextual')) break;
      englishText += (englishText ? ' ' : '') + line;
    }
  }
  
  // Clean up text - remove zero-width characters
  banglaText = banglaText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  englishText = englishText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  
  if (!banglaText && !englishText) return null;
  
  return {
    id,
    title,
    words,
    banglaText,
    englishText,
  };
}

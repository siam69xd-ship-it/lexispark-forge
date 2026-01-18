import WordDetailPanel from '@/components/WordDetailPanel';
import { Word } from '@/lib/wordParser';

interface WordTooltipProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkLearned?: (wordId: string, word: string) => void;
  onToggleFavorite?: (wordId: string, word: string) => void;
  isLearned?: boolean;
  isFavorite?: boolean;
  showActions?: boolean;
}

// Re-export WordDetailPanel as WordTooltip for backward compatibility
export default function WordTooltip(props: WordTooltipProps) {
  return <WordDetailPanel {...props} />;
}

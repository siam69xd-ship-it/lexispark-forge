import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WordProgress {
  id: string;
  word_id: string;
  word: string;
  status: 'viewed' | 'learned' | 'favorite';
  view_count: number;
  first_viewed_at: string;
  last_viewed_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_type: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  completed_at: string;
}

export interface DailyStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface ProgressStats {
  totalWordsViewed: number;
  totalWordsLearned: number;
  totalFavorites: number;
  todayWords: number;
  quizzesTaken: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
}

export function useProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wordProgress, setWordProgress] = useState<WordProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [streak, setStreak] = useState<DailyStreak | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch word progress
      const { data: words, error: wordsError } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_viewed_at', { ascending: false });

      if (wordsError) throw wordsError;

      // Fetch quiz attempts
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (quizzesError) throw quizzesError;

      // Fetch streak
      const { data: streakData, error: streakError } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakError) throw streakError;

      const wordData = (words || []) as WordProgress[];
      const quizData = (quizzes || []) as QuizAttempt[];

      setWordProgress(wordData);
      setQuizAttempts(quizData);
      setStreak(streakData);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayWords = wordData.filter(w => 
        w.last_viewed_at.split('T')[0] === today
      ).length;

      const avgScore = quizData.length > 0
        ? quizData.reduce((acc, q) => acc + Number(q.score_percentage), 0) / quizData.length
        : 0;

      setStats({
        totalWordsViewed: wordData.length,
        totalWordsLearned: wordData.filter(w => w.status === 'learned').length,
        totalFavorites: wordData.filter(w => w.status === 'favorite').length,
        todayWords,
        quizzesTaken: quizData.length,
        averageScore: Math.round(avgScore),
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const trackWordView = async (wordId: string, word: string) => {
    if (!user) return;

    try {
      // Check if word already exists
      const { data: existing } = await supabase
        .from('user_word_progress')
        .select('id, view_count')
        .eq('user_id', user.id)
        .eq('word_id', wordId)
        .maybeSingle();

      if (existing) {
        // Update view count
        await supabase
          .from('user_word_progress')
          .update({
            view_count: existing.view_count + 1,
            last_viewed_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('user_word_progress')
          .insert({
            user_id: user.id,
            word_id: wordId,
            word: word,
            status: 'viewed'
          });
      }

      // Update streak
      await updateStreak();
      
      // Refresh progress
      await fetchProgress();
    } catch (error) {
      console.error('Error tracking word view:', error);
    }
  };

  const markWordAsLearned = async (wordId: string, word: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('user_word_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('word_id', wordId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_word_progress')
          .update({ status: 'learned', last_viewed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_word_progress')
          .insert({
            user_id: user.id,
            word_id: wordId,
            word: word,
            status: 'learned'
          });
      }

      toast({
        title: "Word Marked as Learned!",
        description: `"${word}" has been added to your learned words.`
      });

      await fetchProgress();
    } catch (error) {
      console.error('Error marking word as learned:', error);
    }
  };

  const toggleFavorite = async (wordId: string, word: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('user_word_progress')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('word_id', wordId)
        .maybeSingle();

      if (existing) {
        const newStatus = existing.status === 'favorite' ? 'viewed' : 'favorite';
        await supabase
          .from('user_word_progress')
          .update({ status: newStatus })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_word_progress')
          .insert({
            user_id: user.id,
            word_id: wordId,
            word: word,
            status: 'favorite'
          });
      }

      await fetchProgress();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const saveQuizAttempt = async (
    quizType: string,
    totalQuestions: number,
    correctAnswers: number
  ) => {
    if (!user) return;

    try {
      const scorePercentage = (correctAnswers / totalQuestions) * 100;

      await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_type: quizType,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          score_percentage: scorePercentage
        });

      await updateStreak();
      await fetchProgress();
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const lastActivity = existing.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = existing.current_streak;
        
        if (lastActivity === today) {
          // Already active today, no change
          return;
        } else if (lastActivity === yesterdayStr) {
          // Continuing streak
          newStreak = existing.current_streak + 1;
        } else {
          // Streak broken, start fresh
          newStreak = 1;
        }

        await supabase
          .from('daily_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, existing.longest_streak),
            last_activity_date: today
          })
          .eq('user_id', user.id);
      } else {
        // Create new streak record
        await supabase
          .from('daily_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today
          });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const isWordLearned = (wordId: string) => {
    return wordProgress.some(w => w.word_id === wordId && w.status === 'learned');
  };

  const isWordFavorite = (wordId: string) => {
    return wordProgress.some(w => w.word_id === wordId && w.status === 'favorite');
  };

  const getWordProgress = (wordId: string) => {
    return wordProgress.find(w => w.word_id === wordId);
  };

  return {
    wordProgress,
    quizAttempts,
    streak,
    stats,
    loading,
    trackWordView,
    markWordAsLearned,
    toggleFavorite,
    saveQuizAttempt,
    isWordLearned,
    isWordFavorite,
    getWordProgress,
    refreshProgress: fetchProgress
  };
}

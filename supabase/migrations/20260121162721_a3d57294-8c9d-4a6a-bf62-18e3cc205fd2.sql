-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  login_provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user_word_progress table for vocabulary tracking
CREATE TABLE IF NOT EXISTS public.user_word_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  word TEXT NOT NULL,
  status TEXT DEFAULT 'viewed' CHECK (status IN ('viewed', 'learned', 'favorite')),
  view_count INTEGER DEFAULT 1,
  first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, word_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_id ON public.user_word_progress(user_id);

-- Enable RLS
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_word_progress
CREATE POLICY "Users can view their own word progress" 
ON public.user_word_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own word progress" 
ON public.user_word_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own word progress" 
ON public.user_word_progress FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own word progress" 
ON public.user_word_progress FOR DELETE 
USING (auth.uid() = user_id);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_type TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts" 
ON public.quiz_attempts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts" 
ON public.quiz_attempts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create daily_streaks table
CREATE TABLE IF NOT EXISTS public.daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_id ON public.daily_streaks(user_id);

-- Enable RLS
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_streaks
CREATE POLICY "Users can view their own streaks" 
ON public.daily_streaks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
ON public.daily_streaks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.daily_streaks FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, login_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
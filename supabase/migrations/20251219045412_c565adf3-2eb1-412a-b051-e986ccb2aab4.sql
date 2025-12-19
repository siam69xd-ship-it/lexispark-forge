-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  login_provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create user_word_progress table for tracking learned/viewed words
CREATE TABLE public.user_word_progress (
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

-- Enable RLS on user_word_progress
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;

-- Word progress policies
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
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_type TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quiz attempts policies
CREATE POLICY "Users can view their own quiz attempts"
ON public.quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create daily_streaks table for tracking learning streaks
CREATE TABLE public.daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on daily_streaks
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

-- Daily streaks policies
CREATE POLICY "Users can view their own streaks"
ON public.daily_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
ON public.daily_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.daily_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, login_provider, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN NEW.raw_app_meta_data ->> 'provider' = 'google' THEN 'google'
      ELSE 'email'
    END,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Initialize daily streak for new user
  INSERT INTO public.daily_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_streaks_updated_at
  BEFORE UPDATE ON public.daily_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
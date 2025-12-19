import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Star, 
  Flame, 
  Trophy, 
  Calendar,
  Clock,
  TrendingUp,
  Target,
  Loader2,
  ArrowRight,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { stats, wordProgress, quizAttempts, loading: progressLoading } = useProgress();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const recentWords = wordProgress.slice(0, 6);
  const recentQuizzes = quizAttempts.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-2 border-primary"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {profile?.name || 'Learner'}!
              </h1>
              <p className="text-muted-foreground">
                Keep up the great work on your vocabulary journey
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut().then(() => navigate('/'))}
            className="w-fit"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="glass border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalWordsViewed || 0}</p>
                    <p className="text-xs text-muted-foreground">Words Viewed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass border-border hover:border-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalWordsLearned || 0}</p>
                    <p className="text-xs text-muted-foreground">Words Learned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass border-border hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalFavorites || 0}</p>
                    <p className="text-xs text-muted-foreground">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass border-border hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Progress & Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Today's Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Words studied today</span>
                    <span className="text-foreground font-medium">{stats?.todayWords || 0} / 10</span>
                  </div>
                  <Progress value={((stats?.todayWords || 0) / 10) * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Quizzes</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{stats?.quizzesTaken || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-accent" />
                      <span className="text-xs text-muted-foreground">Avg Score</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{stats?.averageScore || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/words">
                  <Button className="w-full justify-between bg-secondary hover:bg-secondary/80 text-foreground">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Explore Words
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/read-and-learn">
                  <Button className="w-full justify-between bg-secondary hover:bg-secondary/80 text-foreground">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Read & Learn
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/quiz">
                  <Button className="w-full justify-between bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <span className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Take a Quiz
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/flashcards">
                  <Button className="w-full justify-between bg-secondary hover:bg-secondary/80 text-foreground">
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Flashcards
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Words */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Words
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentWords.length > 0 ? (
                  <div className="space-y-2">
                    {recentWords.map((word, index) => (
                      <motion.div
                        key={word.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground capitalize">{word.word}</span>
                          {word.status === 'learned' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">Learned</span>
                          )}
                          {word.status === 'favorite' && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {word.view_count} views
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No words viewed yet. Start exploring!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Trophy className="h-5 w-5 text-accent" />
                  Recent Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentQuizzes.length > 0 ? (
                  <div className="space-y-2">
                    {recentQuizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                      >
                        <div>
                          <span className="font-medium text-foreground capitalize">{quiz.quiz_type}</span>
                          <p className="text-xs text-muted-foreground">
                            {quiz.correct_answers}/{quiz.total_questions} correct
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${
                          Number(quiz.score_percentage) >= 80 ? 'text-green-500' :
                          Number(quiz.score_percentage) >= 50 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {Math.round(Number(quiz.score_percentage))}%
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No quizzes taken yet. Test your knowledge!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { WordProvider } from "@/context/WordContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const WordsPage = lazy(() => import("@/pages/WordsPage"));
const WordDetailPage = lazy(() => import("@/pages/WordDetailPage"));
const QuizPage = lazy(() => import("@/pages/QuizPage"));
const FlashcardsPage = lazy(() => import("@/pages/FlashcardsPage"));
const ReadAndLearnPage = lazy(() => import("@/pages/ReadAndLearnPage"));
const GrammarPage = lazy(() => import("@/pages/GrammarPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
      retry: 1,
      retryDelay: 500,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WordProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<><Navbar /><HomePage /></>} />
                    <Route path="/words" element={<><Navbar /><WordsPage /></>} />
                    <Route path="/word/:id" element={<><Navbar /><WordDetailPage /></>} />
                    <Route path="/quiz" element={<><Navbar /><QuizPage /></>} />
                    <Route path="/flashcards" element={<><Navbar /><FlashcardsPage /></>} />
                    <Route path="/read-and-learn" element={<><Navbar /><ReadAndLearnPage /></>} />
                    <Route path="/grammar" element={<><Navbar /><GrammarPage /></>} />
                    <Route path="/about" element={<><Navbar /><AboutPage /></>} />
                    <Route path="/terms" element={<><Navbar /><TermsPage /></>} />
                    <Route path="/privacy" element={<><Navbar /><PrivacyPage /></>} />
                    <Route path="/faq" element={<><Navbar /><FAQPage /></>} />
                    <Route path="/contact" element={<><Navbar /><ContactPage /></>} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/dashboard" element={<><Navbar /><DashboardPage /></>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </WordProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

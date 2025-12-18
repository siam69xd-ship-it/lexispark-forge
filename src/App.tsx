import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { WordProvider } from "@/context/WordContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
const AboutPage = lazy(() => import("@/pages/AboutPage"));

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
        <WordProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/words" element={<WordsPage />} />
                  <Route path="/word/:id" element={<WordDetailPage />} />
                  <Route path="/quiz" element={<QuizPage />} />
                  <Route path="/flashcards" element={<FlashcardsPage />} />
                  <Route path="/read-and-learn" element={<ReadAndLearnPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </WordProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

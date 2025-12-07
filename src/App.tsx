import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WordProvider } from "@/context/WordContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import WordsPage from "@/pages/WordsPage";
import WordDetailPage from "@/pages/WordDetailPage";
import QuizPage from "@/pages/QuizPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import AboutPage from "@/pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <WordProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/words" element={<WordsPage />} />
              <Route path="/word/:id" element={<WordDetailPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WordProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

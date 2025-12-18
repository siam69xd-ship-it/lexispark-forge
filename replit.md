# VocaForge - Vocabulary Learning Platform

## Overview
VocaForge is a vocabulary learning platform that helps users build vocabulary through smart definitions, Bangla translations, interactive quizzes, and personalized flashcards.

## Project Structure
- `src/` - React frontend application
  - `components/` - Reusable UI components (using Shadcn)
  - `pages/` - Page components (Home, Words, Quiz, Flashcards, Read & Learn, About)
  - `context/` - React context providers (Theme, Word)
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and parsers
- `public/data/` - Static data files
  - `words_english.txt` - English word definitions
  - `words_bangla.txt` - Bangla translations
  - `passages.txt` - Reading passages

## Tech Stack
- React 18 with TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation
- TanStack Query for data fetching
- Framer Motion for animations

## Running the Project
The application runs on port 5000 using Vite dev server:
```bash
npm run dev
```

## Data Storage
- Word data is loaded from static text files in `public/data/`
- User progress (flashcards, memorized words) is stored in localStorage

## Deployment
Configured for static deployment - the `npm run build` command generates static files to the `dist/` directory.

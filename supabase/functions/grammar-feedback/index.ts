import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  bengaliText: string;
  userTranslation: string;
  correctTranslation: string;
  chapterTitle: string;
  grammarFocus?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bengaliText, userTranslation, correctTranslation, chapterTitle, grammarFocus } = await req.json() as FeedbackRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert English grammar tutor specializing in helping Bengali speakers learn English translation. You provide detailed, encouraging, and constructive feedback on grammar translations.

Your task is to analyze a student's English translation of a Bengali sentence and provide comprehensive feedback.

Focus areas for this chapter: ${chapterTitle}
${grammarFocus ? `Specific grammar focus: ${grammarFocus}` : ''}

Respond ONLY with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "score": <number 0-100>,
  "isCorrect": <boolean, true if score >= 70>,
  "strengths": [<array of 2-4 specific things done well>],
  "improvements": [<array of 2-4 specific areas to improve>],
  "correctedVersion": "<the ideal English translation>",
  "grammarTips": [<array of 2-3 relevant grammar tips based on errors found>],
  "overallComment": "<a 2-3 sentence encouraging summary of performance>"
}

Be specific and constructive. Highlight correct usage of grammar rules, vocabulary choices, and sentence structure. For improvements, explain WHY something is incorrect and HOW to fix it.`;

    const userPrompt = `Bengali sentence to translate:
"${bengaliText}"

Student's translation:
"${userTranslation}"

Reference translation:
"${correctTranslation}"

Please analyze the student's translation and provide detailed feedback.`;

    console.log("Sending request to AI gateway for grammar feedback...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response received:", content.substring(0, 200));

    // Parse the JSON response
    let feedback;
    try {
      // Remove any markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      feedback = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback to basic feedback
      feedback = generateFallbackFeedback(userTranslation, correctTranslation);
    }

    return new Response(JSON.stringify(feedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Grammar feedback error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateFallbackFeedback(userAnswer: string, correctAnswer: string) {
  const userWords = userAnswer.toLowerCase().trim().split(/\s+/);
  const correctWords = correctAnswer.toLowerCase().trim().split(/\s+/);
  
  const matchingWords = userWords.filter(w => correctWords.includes(w));
  const similarity = matchingWords.length / Math.max(correctWords.length, 1);
  const score = Math.round(similarity * 100);
  
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  if (similarity >= 0.8) {
    strengths.push("Excellent overall translation accuracy");
    strengths.push("Good vocabulary usage");
  } else if (similarity >= 0.5) {
    strengths.push("Good understanding of the main concept");
    strengths.push("Some key vocabulary captured correctly");
  } else {
    strengths.push("Attempted to translate the full sentence");
  }
  
  if (similarity < 0.8) {
    improvements.push("Review the correct translation for proper sentence structure");
    improvements.push("Pay attention to verb forms and tense usage");
  }
  
  if (!userAnswer.match(/^[A-Z]/)) {
    improvements.push("Remember to capitalize the first letter of sentences");
  }
  
  return {
    score,
    isCorrect: score >= 70,
    strengths,
    improvements,
    correctedVersion: correctAnswer,
    grammarTips: [
      "Focus on subject-verb agreement",
      "Use appropriate articles (a, an, the)",
      "Match the tense of the original sentence"
    ],
    overallComment: score >= 70 
      ? "Good job! Your translation captures the meaning well. Keep practicing to refine your grammar skills."
      : "Keep practicing! Review the grammar rules in this chapter and compare your translation with the correct version."
  };
}

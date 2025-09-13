import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ScoringResult {
  score: number; // 1-10
  feedback: string;
  criteria: {
    accuracy: number; // How well it matches the description
    creativity: number; // Creative interpretation
    technique: number; // Drawing quality
    completeness: number; // How complete the drawing is
  };
}

export async function scoreDrawing(
  drawingDataUrl: string,
  description: string,
  theme?: string
): Promise<ScoringResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert data URL to format Gemini can understand
    const imageData = dataUrlToGenerativePart(drawingDataUrl);

    // Create the scoring prompt
    const prompt = createScoringPrompt(description, theme);

    // Generate content with image and text
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    return parseAIResponse(text);
  } catch (error) {
    console.error('Error scoring drawing with Gemini:', error);
    
    // Return a default score if AI fails
    return {
      score: 5,
      feedback: "Unable to analyze drawing automatically. Manual review recommended.",
      criteria: {
        accuracy: 5,
        creativity: 5,
        technique: 5,
        completeness: 5
      }
    };
  }
}

function dataUrlToGenerativePart(dataUrl: string) {
  // Extract the base64 data and mime type
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  
  return {
    inlineData: {
      data,
      mimeType
    }
  };
}

function createScoringPrompt(description: string, theme?: string): string {
  return `
You are an expert art judge for a competitive drawing game called "baselume". Your task is to score a drawing on a scale of 1-10 based on how well it matches the given description.

**Drawing Description:** "${description}"
${theme ? `**Theme:** "${theme}"` : ''}

Please evaluate the drawing based on these criteria:

1. **Accuracy (40%)**: How well does the drawing match the description?
2. **Creativity (25%)**: How creative and imaginative is the interpretation?
3. **Technique (20%)**: Quality of the drawing technique and execution
4. **Completeness (15%)**: How complete and finished does the drawing appear?

**Scoring Guidelines:**
- 1-2: Poor - Doesn't match description, very basic or incomplete
- 3-4: Below Average - Some elements match, but missing key components
- 5-6: Average - Matches description reasonably well with some creativity
- 7-8: Good - Strong match with good creativity and technique
- 9-10: Excellent - Perfect match with exceptional creativity and skill

**Response Format (JSON):**
{
  "score": [overall score 1-10],
  "feedback": "[brief constructive feedback about the drawing]",
  "criteria": {
    "accuracy": [1-10],
    "creativity": [1-10], 
    "technique": [1-10],
    "completeness": [1-10]
  }
}

Be fair but encouraging in your feedback. Focus on what the artist did well while noting areas for improvement.
`;
}

function parseAIResponse(text: string): ScoringResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      const score = Math.max(1, Math.min(10, Math.round(parsed.score || 5)));
      const feedback = parsed.feedback || "Good effort! Keep practicing.";
      
      const criteria = {
        accuracy: Math.max(1, Math.min(10, Math.round(parsed.criteria?.accuracy || 5))),
        creativity: Math.max(1, Math.min(10, Math.round(parsed.criteria?.creativity || 5))),
        technique: Math.max(1, Math.min(10, Math.round(parsed.criteria?.technique || 5))),
        completeness: Math.max(1, Math.min(10, Math.round(parsed.criteria?.completeness || 5)))
      };

      return {
        score,
        feedback,
        criteria
      };
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }

  // Fallback parsing for non-JSON responses
  const scoreMatch = text.match(/score[:\s]*(\d+)/i);
  const score = scoreMatch ? Math.max(1, Math.min(10, parseInt(scoreMatch[1]))) : 5;

  return {
    score,
    feedback: "Drawing evaluated. Keep up the good work!",
    criteria: {
      accuracy: score,
      creativity: score,
      technique: score,
      completeness: score
    }
  };
}

// Batch scoring for multiple submissions
export async function scoreMultipleDrawings(
  submissions: Array<{
    id: string;
    drawingData: string;
    description: string;
    theme?: string;
  }>
): Promise<Array<{ id: string; result: ScoringResult }>> {
  const results = [];
  
  for (const submission of submissions) {
    try {
      const result = await scoreDrawing(
        submission.drawingData,
        submission.description,
        submission.theme
      );
      results.push({ id: submission.id, result });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error scoring submission ${submission.id}:`, error);
      results.push({
        id: submission.id,
        result: {
          score: 5,
          feedback: "Unable to score automatically",
          criteria: {
            accuracy: 5,
            creativity: 5,
            technique: 5,
            completeness: 5
          }
        }
      });
    }
  }
  
  return results;
}

// Helper function to get scoring statistics
export function calculateScoreStats(scores: number[]): {
  average: number;
  highest: number;
  lowest: number;
  distribution: { [key: string]: number };
} {
  if (scores.length === 0) {
    return {
      average: 0,
      highest: 0,
      lowest: 0,
      distribution: {}
    };
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  // Score distribution
  const distribution: { [key: string]: number } = {};
  for (let i = 1; i <= 10; i++) {
    distribution[i.toString()] = scores.filter(score => score === i).length;
  }

  return {
    average: Math.round(average * 10) / 10,
    highest,
    lowest,
    distribution
  };
}

'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating multiple-choice physics quiz questions.
 *
 * - generateQuizQuestions - A function that handles the generation of quiz questions.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the generateQuizQuestions flow.
 * Defines the topic and difficulty level for the quiz questions.
 */
const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The physics topic for the quiz questions (e.g., "Mechanics", "Electromagnetism", "Optics").'),
  difficulty: z.enum(['Conceptual', 'Applied Conceptual', 'Intermediate', 'Advanced']).describe('The difficulty level for the quiz questions.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

/**
 * Schema for a single quiz question.
 * Includes the question text, options, correct answer, and explanation.
 */
const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question, potentially with LaTeX equations.'),
  options: z.array(z.string()).min(4).max(4).describe('An array of four possible answer options for the question.'),
  correctAnswer: z.string().describe('The exact text of the correct option, which must be one of the provided options.'),
  explanation: z.string().describe('A detailed explanation for the correct answer, suitable for a student.'),
});

/**
 * Output schema for the generateQuizQuestions flow.
 * Contains an array of generated quiz questions.
 */
const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('A list of generated multiple-choice quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

/**
 * Defines the prompt for generating multiple-choice quiz questions.
 * It instructs the model to act as an expert physics instructor and generate questions
 * based on the provided topic and difficulty, including LaTeX for equations and detailed explanations.
 */
const generateQuizQuestionsPrompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert physics instructor. Your task is to generate multiple-choice questions (MCQs) for a physics quiz.
Generate 5 distinct questions.
Each question must adhere to the following structure:
- 'questionText': The text of the multiple-choice question. Use KaTeX/LaTeX format for all equations, variables, and units (e.g., $E=mc^2$).
- 'options': An array containing exactly four distinct answer choices for the question.
- 'correctAnswer': The exact text of the correct option, which must be one of the 'options'.
- 'explanation': A detailed, step-by-step explanation for the correct answer, suitable for a student.

The questions should be focused on the topic of "{{{topic}}}" and be appropriate for a "{{{difficulty}}}" difficulty level.

Example for a 'Conceptual' question on 'Mechanics':
{
  "questionText": "What is the primary factor determining the period of a simple pendulum, assuming small oscillations?",
  "options": [
    "The mass of the pendulum bob",
    "The amplitude of the swing",
    "The length of the pendulum string",
    "The initial velocity of the bob"
  ],
  "correctAnswer": "The length of the pendulum string",
  "explanation": "For a simple pendulum undergoing small oscillations, the period ($T$) is primarily determined by its length ($L$) and the acceleration due to gravity ($g$), according to the formula $T = 2\pi\sqrt{\frac{L}{g}}$. The mass of the bob and the amplitude (for small angles) have negligible effects."
}
`,
});

/**
 * Defines the Genkit flow for generating quiz questions.
 * This flow takes a topic and difficulty as input, calls the AI prompt,
 * and returns a list of generated multiple-choice questions.
 */
const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await generateQuizQuestionsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate quiz questions: The AI model did not return any output.');
    }
    return output;
  }
);

/**
 * Wrapper function to execute the generateQuizQuestions Genkit flow.
 * This function can be called from Next.js React components to generate quiz questions.
 * @param input - An object containing the topic and difficulty level for the questions.
 * @returns A promise that resolves to an object containing a list of generated quiz questions.
 */
export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

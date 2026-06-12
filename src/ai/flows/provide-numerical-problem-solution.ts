'use server';
/**
 * @fileOverview An AI assistant flow that provides detailed, step-by-step solutions
 * for numerical physics problems, highlighting key formulas.
 *
 * - provideNumericalProblemSolution - A function that handles the numerical problem-solving process.
 * - ProvideNumericalProblemSolutionInput - The input type for the provideNumericalProblemSolution function.
 * - ProvideNumericalProblemSolutionOutput - The return type for the provideNumericalProblemSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideNumericalProblemSolutionInputSchema = z.object({
  problemStatement: z
    .string()
    .describe(
      'The full numerical physics problem statement, potentially including LaTeX for equations.'
    ),
});
export type ProvideNumericalProblemSolutionInput = z.infer<
  typeof ProvideNumericalProblemSolutionInputSchema
>;

const ProvideNumericalProblemSolutionOutputSchema = z.object({
  solutionSteps: z
    .array(
      z.object({
        stepNumber: z.number().describe('The sequential number of the solution step.'),
        description: z
          .string()
          .describe(
            'The detailed explanation for this step, including calculations and LaTeX-formatted equations where appropriate.'
          ),
      })
    )
    .describe('A list of step-by-step instructions to solve the problem.'),
  keyFormulas: z
    .array(
      z
        .string()
        .describe(
          'A key formula used in the solution, formatted with LaTeX for rendering.'
        )
    )
    .describe('A list of key formulas used throughout the solution.'),
  overallExplanation: z
    .string()
    .describe(
      'An overall explanation of the problem-solving methodology, concepts involved, and how to approach similar problems.'
    ),
});
export type ProvideNumericalProblemSolutionOutput = z.infer<
  typeof ProvideNumericalProblemSolutionOutputSchema
>;

export async function provideNumericalProblemSolution(
  input: ProvideNumericalProblemSolutionInput
): Promise<ProvideNumericalProblemSolutionOutput> {
  return numericalProblemSolutionFlow(input);
}

const numericalProblemSolutionPrompt = ai.definePrompt({
  name: 'numericalProblemSolutionPrompt',
  input: {schema: ProvideNumericalProblemSolutionInputSchema},
  output: {schema: ProvideNumericalProblemSolutionOutputSchema},
  prompt: `You are an expert physics tutor and problem solver. Your task is to provide a detailed, step-by-step solution to a given numerical physics problem.
Ensure that the solution is clear, logical, and easy to understand for a college student.
Highlight any key formulas used and provide an overall explanation of the problem-solving methodology.
Use LaTeX formatting for all mathematical equations, symbols, and units. For example, use $\\frac{1}{2}mv^2$ for kinetic energy.

Problem Statement:
{{{problemStatement}}}`,
});

const numericalProblemSolutionFlow = ai.defineFlow(
  {
    name: 'numericalProblemSolutionFlow',
    inputSchema: ProvideNumericalProblemSolutionInputSchema,
    outputSchema: ProvideNumericalProblemSolutionOutputSchema,
  },
  async input => {
    const {output} = await numericalProblemSolutionPrompt(input);
    return output!;
  }
);

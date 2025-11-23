'use server';

/**
 * @fileOverview Provides historical context for a family member based on their profile information.
 *
 * @exports historicalContextForFamilyMember - Function to retrieve historical insights.
 * @exports HistoricalContextInput - Input type for the historical context flow.
 * @exports HistoricalContextOutput - Output type for the historical context flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HistoricalContextInputSchema = z.object({
  name: z.string().describe('The name of the family member.'),
  birthDate: z.string().describe('The birth date of the family member (YYYY-MM-DD).'),
  birthplace: z.string().describe('The birthplace of the family member.'),
  biography: z.string().optional().describe('A short biography of the family member.'),
});

export type HistoricalContextInput = z.infer<typeof HistoricalContextInputSchema>;

const HistoricalContextOutputSchema = z.object({
  nameMeaning: z.string().describe('The meaning and origin of the family member’s name.'),
  historicalEvents: z.string().describe('Significant historical events that occurred during the family member’s lifetime.'),
  birthplaceInformation: z.string().describe('Relevant information about the family member’s birthplace.'),
  additionalInsights: z.string().optional().describe('Any additional historical insights related to the family member.'),
});

export type HistoricalContextOutput = z.infer<typeof HistoricalContextOutputSchema>;

export async function historicalContextForFamilyMember(input: HistoricalContextInput): Promise<HistoricalContextOutput> {
  return historicalContextFlow(input);
}

const historicalContextPrompt = ai.definePrompt({
  name: 'historicalContextPrompt',
  input: {schema: HistoricalContextInputSchema},
  output: {schema: HistoricalContextOutputSchema},
  prompt: `Provide historical context and insights related to the following family member:

Name: {{{name}}}
Birth Date: {{{birthDate}}}
Birthplace: {{{birthplace}}}
Biography: {{{biography}}}

Specifically, provide the following information:

*   The meaning and origin of their name.
*   Significant historical events that occurred during their lifetime.
*   Relevant information about their birthplace.
*   Any additional historical insights related to the family member.

Ensure the information is accurate and well-researched. Format the output as described in the output schema descriptions.
`,
});

const historicalContextFlow = ai.defineFlow(
  {
    name: 'historicalContextFlow',
    inputSchema: HistoricalContextInputSchema,
    outputSchema: HistoricalContextOutputSchema,
  },
  async input => {
    const {output} = await historicalContextPrompt(input);
    return output!;
  }
);

// @ts-nocheck
'use server';

import {
  historicalContextForFamilyMember,
  type HistoricalContextInput,
} from '@/ai/flows/historical-context-family-member';
import type { FamilyMember } from '@/lib/types';

export async function getHistoricalContext(input: HistoricalContextInput) {
  try {
    const result = await historicalContextForFamilyMember(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting historical context:', error);
    // If the error indicates the AI provider is unconfigured, return a
    // helpful message instructing the developer how to enable it.
    const msg = (error && (error as any).message) || '';
    if (/GEMINI_API_KEY|GOOGLE_API_KEY|API key|AI provider not configured/i.test(msg)) {
      return {
        success: false,
        error:
          'Historical insights are unavailable because the AI provider is not configured. Set the environment variable `GEMINI_API_KEY` or `GOOGLE_API_KEY` to enable this feature.',
      };
    }

    // Fallback generic message for other unexpected errors.
    return { success: false, error: 'An unexpected error occurred while fetching historical insights. Please try again later.' };
  }
}

// NOTE: This is a temporary solution for prototyping.
// In a production application, you would use a database.
export async function saveFamilyMembers(members: FamilyMember[]) {
    try {
        // This is a simplified example. In a real app, you'd have to do this
        // via an API route and be careful about security. We are directly
        // writing to the file system here for demonstration purposes.
        const filePath = 'src/lib/initial-data.ts';
        
        const fileContent = `import type { FamilyMember } from '@/lib/types';

export const initialMembers: FamilyMember[] = ${JSON.stringify(members, null, 2)};
`;
        await require('fs').promises.writeFile(filePath, fileContent, 'utf-8');

        return { success: true };
    } catch (error) {
        console.error('Error saving family members:', error);
        return { success: false, error: 'Failed to save family member data.' };
    }
}

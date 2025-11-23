// @ts-nocheck
'use server';

import {
  historicalContextForFamilyMember,
  type HistoricalContextInput,
} from '@/ai/flows/historical-context-family-member';

export async function getHistoricalContext(input: HistoricalContextInput) {
  try {
    const result = await historicalContextForFamilyMember(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting historical context:', error);
    // It's better to return a generic error message to the client
    return { success: false, error: 'An unexpected error occurred while fetching historical insights. Please try again later.' };
  }
}

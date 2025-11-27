import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

// By default, if the AI provider isn't configured, Genkit will throw an error
// during initialization. We want to avoid this to have a smoother developer
// experience. Instead, we'll shim the AI provider if it's not configured and
// throw an error only when a flow or prompt is actually invoked.

let ai: any;

try {
  // Test if the googleAI() plugin can be initialized.
  // This will throw an error if the API key is not set.
  googleAI();

  // If the above line doesn't throw, we can initialize Genkit with the plugin.
  ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  });
} catch (err: any) {
  // Log full error for debugging in server logs
  console.error(
    `AI provider initialization failed. AI features will be disabled. Reason: ${err?.message ?? err}`
  );

  const providerErrorMessage =
    'AI provider not configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable to enable AI features.';

  // If initialization fails, create a shim implementation for Genkit functions.
  // This allows the rest of the application to run without crashing.
  ai = {
    definePrompt: (_opts: any) => {
      // The prompt returns a function that will throw when invoked.
      return async () => {
        throw new Error(providerErrorMessage);
      };
    },
    defineFlow: (_opts: any, handler: any) => {
      // The flow returns a function that will throw when invoked.
      return async (_input: any) => {
        throw new Error(providerErrorMessage);
      };
    },
    // Add shims for other genkit functions if needed, e.g., defineTool
    defineTool: (_opts: any) => {
      return async () => {
        throw new Error(providerErrorMessage);
      };
    },
    // Add a shim for a generic `generate` function if used directly.
    generate: async (_opts: any) => {
      throw new Error(providerErrorMessage);
    },
    // Provide a valid `model` property on the shim.
    model: (_name: string) => {
      return {name: _name, provider: 'shim'};
    },
  };
}

export {ai};

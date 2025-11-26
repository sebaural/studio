import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Try to initialize the real AI client. If initialization fails (for example
// because environment variables like GEMINI_API_KEY / GOOGLE_API_KEY are
// missing), export a safe shim that delays throwing until the prompt/flow is
// actually invoked. This prevents import-time crashes and allows flows to
// handle provider-unavailable cases gracefully.
let ai: any;
try {
  ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  });
} catch (err: any) {
  // Log full error for debugging in server logs
  console.error('AI initialization failed:', err?.message ?? err);

  const providerErrorMessage =
    err && err.message && /api key|GEMINI_API_KEY|GOOGLE_API_KEY/i.test(err.message)
      ? 'AI provider not configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.'
      : 'AI provider initialization failed.';

  // Shim implementations for `definePrompt` and `defineFlow`.
  ai = {
    definePrompt: (_opts: any) => {
      return async () => {
        throw new Error(providerErrorMessage);
      };
    },
    defineFlow: (_opts: any, handler: any) => {
      // Return a function that will attempt to run the handler. The handler
      // will likely call the prompt shim above and therefore throw the
      // providerErrorMessage when invoked.
      return async (input: any) => {
        // Provide a consistent error when the flow is run without a provider.
        throw new Error(providerErrorMessage);
      };
    },
  };
}

export { ai };

/**
 * Simulates a streaming model API response.
 * In production, replace this with a real fetch() to your inference endpoint.
 *
 * Returns a ReadableStream of Uint8Array chunks, exactly as the Fetch API would.
 */

const SAMPLE_OUTPUTS: Record<string, string> = {
  'model-a':
    'Large language models work by predicting the next token in a sequence. ' +
    'They are trained on vast corpora of text using a technique called self-supervised learning. ' +
    'During inference, the model generates tokens one at a time, sampling from a probability distribution ' +
    'over its entire vocabulary. The quality of the output depends heavily on the prompt, ' +
    'the temperature setting, and the model\'s training data. ' +
    'Transformer architectures underpin most modern LLMs, relying on attention mechanisms ' +
    'to capture long-range dependencies in text.',

  'model-b':
    'Large language models generate text by predicting the most probable next token at each step. ' +
    'They learn from enormous datasets via self-supervised objectives, such as next-token prediction. ' +
    'At inference time, tokens are sampled sequentially from a learned probability distribution. ' +
    'Output quality is influenced by the input prompt, sampling temperature, and training distribution. ' +
    'Most contemporary LLMs are built on the Transformer architecture, ' +
    'which uses self-attention to model relationships across long sequences of text efficiently.',
};

export function mockStreamResponse(
  prompt: string,
  modelKey: 'model-a' | 'model-b' = 'model-a',
  delayMs = 40
): ReadableStream<Uint8Array> {
  const text = SAMPLE_OUTPUTS[modelKey] ?? `Echo: ${prompt}`;
  const words = text.split(' ');
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, delayMs + Math.random() * 30));
        const chunk = (i === 0 ? '' : ' ') + words[i];
        controller.enqueue(encoder.encode(chunk));

        // Simulate occasional network hiccup (1% chance)
        if (Math.random() < 0.01) {
          controller.error(new Error('Simulated network interruption'));
          return;
        }
      }
      controller.close();
    },
  });
}

/**
 * Rough token counter — splits on whitespace + punctuation boundaries.
 * For display purposes only; not a true BPE tokenizer.
 */
export function countTokensInChunk(chunk: string): number {
  return (chunk.match(/\S+/g) ?? []).length;
}

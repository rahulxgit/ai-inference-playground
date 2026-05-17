import { useCallback, useRef, useState } from 'react';
import { mockStreamResponse, countTokensInChunk } from '../lib/mockApi';
import type { StreamState } from '../types';

const INITIAL_STATE: StreamState = {
  output: '',
  status: 'idle',
  error: null,
  tokenCount: 0,
  tokensPerSecond: 0,
  elapsedMs: 0,
};

export function useStream(modelKey: 'model-a' | 'model-b' = 'model-a') {
  const [state, setState] = useState<StreamState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const tokenAccRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const start = useCallback(
    async (prompt: string) => {
      // Cancel any in-flight stream
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setState({ ...INITIAL_STATE, status: 'streaming' });
      tokenAccRef.current = 0;
      startTimeRef.current = 0;

      let outputAcc = '';
      let tokenAcc = 0;

      try {
        // In production: replace with real fetch()
        // const response = await fetch('/api/infer', {
        //   method: 'POST',
        //   body: JSON.stringify({ prompt, model: modelKey }),
        //   signal: abortRef.current.signal,
        // });
        // const stream = response.body!;

        const stream = mockStreamResponse(prompt, modelKey);
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setState((prev) => ({ ...prev, status: 'done' }));
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          outputAcc += chunk;
          tokenAcc += countTokensInChunk(chunk);

          // Record start time on first chunk
          if (startTimeRef.current === 0) {
            startTimeRef.current = Date.now();
          }

          const elapsedMs = Date.now() - startTimeRef.current;
          const tokensPerSecond =
            elapsedMs > 0 ? (tokenAcc / elapsedMs) * 1000 : 0;

          // Batch DOM updates via rAF to avoid layout thrashing
          cancelAnimationFrame(rafRef.current);
          const snap = { outputAcc, tokenAcc, elapsedMs, tokensPerSecond };
          rafRef.current = requestAnimationFrame(() => {
            setState((prev) => ({
              ...prev,
              output: snap.outputAcc,
              tokenCount: snap.tokenAcc,
              tokensPerSecond: snap.tokensPerSecond,
              elapsedMs: snap.elapsedMs,
            }));
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;

        // Preserve partial output + show error — never blank the screen
        setState((prev) => ({
          ...prev,
          status: 'error',
          error:
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred.',
        }));
      }
    },
    [modelKey]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) =>
      prev.status === 'streaming' ? { ...prev, status: 'done' } : prev
    );
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    cancelAnimationFrame(rafRef.current);
    setState(INITIAL_STATE);
  }, []);

  return { state, start, stop, reset };
}

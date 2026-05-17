// import React from 'react';
import { InputPanel } from './InputPanel';
import { StreamOutput } from './StreamOutput';
import { MetricsBar } from './MetricsBar';
import { ErrorBanner } from './ErrorBanner';
import { useStream } from '../hooks/useStream';

export function Playground() {
  const { state, start, stop, reset } = useStream('model-a');

  const handleDismissError = () => {
    // Keep output but clear error flag
    reset();
  };

  return (
    <section className="playground" aria-label="Inference playground">
      <div className="playground__header">
        <h2 className="section-title">Inference playground</h2>
        <p className="section-subtitle">
          Token-by-token streaming · live metrics · error recovery
        </p>
      </div>

      <InputPanel
        onSubmit={start}
        isStreaming={state.status === 'streaming'}
        onStop={stop}
      />

      <MetricsBar state={state} />

      {state.status === 'error' && state.error && (
        <ErrorBanner message={state.error} onDismiss={handleDismissError} />
      )}

      <StreamOutput state={state} />

      {(state.status === 'done' || state.status === 'error') && state.output && (
        <div className="playground__actions">
          <button
            className="btn btn--ghost"
            onClick={reset}
            aria-label="Reset playground"
          >
            ↺ Reset
          </button>
          <button
            className="btn btn--ghost"
            onClick={() => navigator.clipboard?.writeText(state.output)}
            aria-label="Copy output to clipboard"
          >
            ⎘ Copy output
          </button>
        </div>
      )}
    </section>
  );
}

import  { useEffect, useRef } from 'react';
import type { StreamState } from '../types';

interface Props {
  state: StreamState;
}

export function StreamOutput({ state }: Props) {
  const { output, status } = state;
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (status === 'streaming') {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [output, status]);

  if (!output && status === 'idle') {
    return (
      <div className="stream-output stream-output--empty" aria-label="Output area">
        <p className="stream-output__placeholder">
          Output will appear here as tokens stream in…
        </p>
      </div>
    );
  }

  return (
    <div
      className={`stream-output ${status === 'error' ? 'stream-output--error' : ''}`}
      role="log"
      aria-live="polite"
      aria-label="Model output"
      aria-relevant="additions"
      tabIndex={0}
    >
      <pre className="stream-output__text">
        {output}
        {status === 'streaming' && (
          <span className="cursor" aria-hidden="true">▋</span>
        )}
      </pre>
      <div ref={endRef} />
    </div>
  );
}

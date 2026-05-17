// import React from 'react';
import type { StreamState } from '../types';

interface Props {
  state: StreamState;
}

export function MetricsBar({ state }: Props) {
  const { tokenCount, tokensPerSecond, elapsedMs, status } = state;
  const isActive = status === 'streaming' || status === 'done';

  const elapsed =
    elapsedMs >= 1000
      ? `${(elapsedMs / 1000).toFixed(1)}s`
      : `${elapsedMs}ms`;

  return (
    <div
      className={`metrics-bar ${isActive ? 'metrics-bar--active' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Stream metrics"
    >
      <div className="metric">
        <span className="metric__label">Tokens</span>
        <span className="metric__value" aria-label={`${tokenCount} tokens`}>
          {tokenCount}
        </span>
      </div>
      <div className="metric-divider" aria-hidden="true" />
      <div className="metric">
        <span className="metric__label">Tokens / sec</span>
        <span
          className="metric__value"
          aria-label={`${tokensPerSecond.toFixed(1)} tokens per second`}
        >
          {isActive ? tokensPerSecond.toFixed(1) : '—'}
        </span>
      </div>
      <div className="metric-divider" aria-hidden="true" />
      <div className="metric">
        <span className="metric__label">Elapsed</span>
        <span className="metric__value">
          {isActive ? elapsed : '—'}
        </span>
      </div>
      <div className="metric-divider" aria-hidden="true" />
      <div className="metric">
        <span className="metric__label">Status</span>
        <span
          className={`metric__badge metric__badge--${status}`}
          aria-label={`Status: ${status}`}
        >
          {status === 'streaming' && (
            <span className="pulse-dot" aria-hidden="true" />
          )}
          {status}
        </span>
      </div>
    </div>
  );
}

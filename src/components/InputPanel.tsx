import React, { useCallback, useRef, useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import type { InputMode } from '../types';

interface Props {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function InputPanel({ onSubmit, isStreaming, onStop }: Props) {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscript = useCallback(
    (transcript: string) => {
      setText(transcript);
      setMode('text');
      setTimeout(() => textareaRef.current?.focus(), 100);
    },
    []
  );

  const { state: recState, start: startRec, stop: stopRec, reset: resetRec } =
    useAudioRecorder(handleTranscript);

  const handleTextSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSubmit(trimmed);
  }, [text, isStreaming, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleTextSubmit();
      }
    },
    [handleTextSubmit]
  );

  const switchMode = (next: InputMode) => {
    if (recState.status === 'recording') stopRec();
    resetRec();
    setMode(next);
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="input-panel">
      {/* Mode toggle */}
      <div
        className="mode-toggle"
        role="group"
        aria-label="Input mode"
      >
        <button
          className={`mode-btn ${mode === 'text' ? 'mode-btn--active' : ''}`}
          onClick={() => switchMode('text')}
          aria-pressed={mode === 'text'}
        >
          <span aria-hidden="true">⌨</span> Text
        </button>
        <button
          className={`mode-btn ${mode === 'audio' ? 'mode-btn--active' : ''}`}
          onClick={() => switchMode('audio')}
          aria-pressed={mode === 'audio'}
        >
          <span aria-hidden="true">🎙</span> Audio
        </button>
      </div>

      {/* Text mode */}
      {mode === 'text' && (
        <div className="text-input-group">
          <label htmlFor="prompt-input" className="sr-only">
            Prompt
          </label>
          <textarea
            id="prompt-input"
            ref={textareaRef}
            className="prompt-textarea"
            placeholder="Enter your prompt… (Ctrl+Enter to run)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            aria-describedby="prompt-hint"
            disabled={isStreaming}
          />
          <span id="prompt-hint" className="sr-only">
            Press Control Enter to submit
          </span>
          <div className="input-actions">
            {isStreaming ? (
              <button
                className="btn btn--danger"
                onClick={onStop}
                aria-label="Stop generation"
              >
                ■ Stop
              </button>
            ) : (
              <button
                className="btn btn--primary"
                onClick={handleTextSubmit}
                disabled={!text.trim()}
                aria-label="Run inference"
              >
                ▶ Run
              </button>
            )}
            <span className="char-count" aria-live="polite">
              {text.length} chars
            </span>
          </div>
        </div>
      )}

      {/* Audio mode */}
      {mode === 'audio' && (
        <div className="audio-panel" role="region" aria-label="Audio recorder">
          {recState.status === 'idle' && (
            <button
              className="record-btn"
              onClick={startRec}
              aria-label="Start recording"
            >
              <span className="record-icon" aria-hidden="true" />
              Start recording
            </button>
          )}

          {recState.status === 'recording' && (
            <div className="recording-active">
              <div className="recording-indicator" aria-hidden="true">
                <span className="rec-pulse" />
                <span className="rec-label">REC</span>
              </div>
              <span
                className="recording-timer"
                aria-live="polite"
                aria-label={`Recording duration: ${formatDuration(recState.durationMs)}`}
              >
                {formatDuration(recState.durationMs)}
              </span>
              <button
                className="btn btn--danger"
                onClick={stopRec}
                aria-label="Stop recording"
              >
                ■ Stop
              </button>
            </div>
          )}

          {recState.status === 'done' && (
            <div className="recording-done">
              <p className="transcript-label">Transcript ready</p>
              <p className="transcript-preview">{recState.transcript}</p>
              <button className="btn btn--ghost" onClick={resetRec}>
                Record again
              </button>
            </div>
          )}

          {recState.error && (
            <p className="audio-error" role="alert">
              {recState.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

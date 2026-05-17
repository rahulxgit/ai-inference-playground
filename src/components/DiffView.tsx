import React, { useState } from 'react';
import { diffTexts } from '../lib/diff';
import type { DiffToken } from '../types';

const MODEL_A_DEFAULT =
  'Large language models work by predicting the next token in a sequence. ' +
  'They are trained on vast corpora of text using self-supervised learning. ' +
  'The quality of output depends heavily on the prompt and temperature setting.';

const MODEL_B_DEFAULT =
  'Large language models generate text by predicting the most probable next token at each step. ' +
  'They learn from enormous datasets via self-supervised objectives. ' +
  'Output quality is influenced by the input prompt, sampling temperature, and training distribution.';

function TokenChip({ token, type }: DiffToken) {
  const classMap: Record<DiffToken['type'], string> = {
    same: 'diff-token',
    add: 'diff-token diff-token--add',
    remove: 'diff-token diff-token--remove',
  };
  const label =
    type === 'add'
      ? `Added: ${token}`
      : type === 'remove'
      ? `Removed: ${token}`
      : token;

  return (
    <span className={classMap[type]} aria-label={label}>
      {token}{' '}
    </span>
  );
}

export function DiffView() {
  const [textA, setTextA] = useState(MODEL_A_DEFAULT);
  const [textB, setTextB] = useState(MODEL_B_DEFAULT);
  const [showDiff, setShowDiff] = useState(false);

  const tokens = showDiff ? diffTexts(textA, textB) : [];

  const aTokens = tokens.filter((t) => t.type !== 'add');
  const bTokens = tokens.filter((t) => t.type !== 'remove');

  const stats = showDiff
    ? {
        added: tokens.filter((t) => t.type === 'add').length,
        removed: tokens.filter((t) => t.type === 'remove').length,
        same: tokens.filter((t) => t.type === 'same').length,
      }
    : null;

  return (
    <div className="diff-view">
      <div className="diff-view__header">
        <h2 className="section-title">Model output diff</h2>
        {stats && (
          <div className="diff-stats" aria-label="Diff statistics">
            <span className="diff-stat diff-stat--same">
              {stats.same} unchanged
            </span>
            <span className="diff-stat diff-stat--add">+{stats.added} added</span>
            <span className="diff-stat diff-stat--remove">
              −{stats.removed} removed
            </span>
          </div>
        )}
      </div>

      {/* Prompt input area */}
      <div className="diff-inputs" role="group" aria-label="Model outputs to compare">
        <div className="diff-input-group">
          <label htmlFor="model-a-output" className="diff-input-label">
            Model A
          </label>
          <textarea
            id="model-a-output"
            className="diff-textarea"
            value={textA}
            onChange={(e) => {
              setTextA(e.target.value);
              setShowDiff(false);
            }}
            rows={5}
            aria-describedby="model-a-desc"
          />
          <span id="model-a-desc" className="sr-only">
            Output from model version A
          </span>
        </div>
        <div className="diff-input-group">
          <label htmlFor="model-b-output" className="diff-input-label">
            Model B
          </label>
          <textarea
            id="model-b-output"
            className="diff-textarea"
            value={textB}
            onChange={(e) => {
              setTextB(e.target.value);
              setShowDiff(false);
            }}
            rows={5}
            aria-describedby="model-b-desc"
          />
          <span id="model-b-desc" className="sr-only">
            Output from model version B
          </span>
        </div>
      </div>

      <button
        className="btn btn--primary diff-run-btn"
        onClick={() => setShowDiff(true)}
        disabled={!textA.trim() || !textB.trim()}
        aria-label="Run token-level diff"
      >
        ⇄ Compare outputs
      </button>

      {/* Side-by-side diff result */}
      {showDiff && (
        <div
          className="diff-result"
          role="region"
          aria-label="Diff result"
        >
          <div className="diff-column">
            <div className="diff-column__header diff-column__header--a">
              Model A
            </div>
            <div
              className="diff-column__body"
              aria-label="Model A output with removals highlighted"
            >
              {aTokens.map((t, i) => (
                <TokenChip key={i} {...t} />
              ))}
            </div>
          </div>

          <div className="diff-column">
            <div className="diff-column__header diff-column__header--b">
              Model B
            </div>
            <div
              className="diff-column__body"
              aria-label="Model B output with additions highlighted"
            >
              {bTokens.map((t, i) => (
                <TokenChip key={i} {...t} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Algorithm explanation */}
      <details className="algo-explainer">
        <summary className="algo-explainer__summary">
          Algorithm: how the diff works
        </summary>
        <div className="algo-explainer__body">
          <h3>Longest Common Subsequence (LCS)</h3>
          <p>
            Both outputs are tokenized on whitespace. The LCS algorithm builds
            an <code>(m+1) × (n+1)</code> DP table where{' '}
            <code>dp[i][j]</code> is the length of the longest common
            subsequence of the first <code>i</code> tokens of A and first{' '}
            <code>j</code> tokens of B. Backtracking through the table
            produces the diff: matching tokens are "same", tokens only in A
            are "removed", tokens only in B are "added".
          </p>
          <p>
            <strong>Time complexity:</strong> O(m × n). For typical model
            outputs (hundreds of tokens) this is negligible.
          </p>
          <p>
            <strong>Why LCS over Myers diff?</strong> Myers is optimised for
            line-level diffs and produces minimal edit scripts — it's what git
            uses. For token-level output comparison where readability of the
            implementation matters, LCS is simpler to verify, produces correct
            results, and the performance difference is irrelevant at this scale.
          </p>
        </div>
      </details>
    </div>
  );
}

# Inference Playground

A React + TypeScript developer portal for on-device model inference, streaming output, and model diff comparison.

---

## Getting started

```bash
npm install
npm run dev
```

---

## Part A — Inference Playground

### Architecture

```
src/
  components/
    Playground.tsx      Root component; composes all sub-components
    InputPanel.tsx      Text/audio toggle input
    StreamOutput.tsx    Live streaming output (role="log", aria-live)
    MetricsBar.tsx      Real-time token count + tokens/sec
    ErrorBanner.tsx     Error state with partial output preservation
  hooks/
    useStream.ts        Core streaming logic via Fetch + ReadableStream
    useAudioRecorder.ts MediaRecorder wrapper with mock transcription
  lib/
    mockApi.ts          Simulated streaming response (replace with real fetch)
    diff.ts             LCS diff algorithm
```

### Streaming

`useStream.ts` opens a `ReadableStream`, reads chunks with `reader.read()`, and appends each decoded chunk to state. DOM updates are batched via `requestAnimationFrame` to avoid layout thrashing. On any mid-stream error, the partial output is preserved and an error banner is shown — the screen is never blanked.

### Metrics

Tokens-per-second is computed as `tokenCount / (elapsedMs / 1000)`, updated on every chunk. The `elapsedMs` clock starts on the first chunk (not on submit), so latency before the first token doesn't pollute the throughput metric.

### Accessibility

- All interactive elements are keyboard navigable and have visible focus rings
- `StreamOutput` uses `role="log"` and `aria-live="polite"` for screen reader announcements
- `ErrorBanner` uses `role="alert"` and `aria-live="assertive"`
- `MetricsBar` uses `role="status"` and `aria-live="polite"`
- Mode toggles use `aria-pressed`; nav tabs use `role="tab"` and `aria-selected`
- All icons are `aria-hidden`; all controls have accessible labels

---

## Part B — Model Output Diff View

### Algorithm: Longest Common Subsequence (LCS)

**Implementation:** `src/lib/diff.ts`

Both outputs are first tokenized by splitting on whitespace (`\S+|\n`). The LCS algorithm then builds an `(m+1) × (n+1)` DP table where `dp[i][j]` = the length of the longest common subsequence of the first `i` tokens from output A and the first `j` tokens from output B. Backtracking through the table produces a sequence of diff operations:

- Tokens present in both → `same`
- Tokens only in A → `remove` (highlighted red in Model A column)
- Tokens only in B → `add` (highlighted green in Model B column)

### Complexity

| | Time | Space |
|---|---|---|
| DP table build | O(m × n) | O(m × n) |
| Backtrack | O(m + n) | — |

For typical model outputs (200–500 tokens), `m × n` is in the range of 40,000–250,000 operations — negligible in a browser.

### Why LCS over alternatives?

**vs Myers diff:**
Myers is an edit-distance minimisation algorithm designed for line-level diffs (it's what `git diff` uses internally). It finds the shortest edit script — optimal for code files where line count matters. At word/token level for model output comparison, producing the shortest edit script isn't the goal; correctly identifying which words changed is. LCS does this cleanly with a simpler implementation that is straightforward to verify and debug.

**vs naive word-by-word comparison:**
A naive element-by-element scan (`a[i] === b[i]`) fails as soon as an insertion or deletion shifts subsequent tokens. A single word added at the beginning of output B would mark every subsequent token as "changed". LCS handles this correctly by finding the globally optimal alignment.

**vs Patience diff:**
Patience diff (used by Bazaar, some git configs) is a refinement of Myers that anchors on unique lines first. It's valuable for source code diffs where unique identifiers provide good anchor points. For model output — natural language without structural anchors — the benefits don't apply.

**Conclusion:** LCS gives correct token-level diffs, is simple enough to implement and explain from scratch (as required), and has O(m×n) performance that is entirely adequate for the output sizes involved.

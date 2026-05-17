# AI Inference Playground

A production-inspired React + TypeScript developer portal for testing on-device AI inference, streaming model responses, and comparing outputs across model versions.

Built as part of a frontend engineering assignment focused on real-time streaming UX, accessibility, and algorithmic diff visualization.

---

## Live Demo

https://ai-inference-playground.vercel.app/

---

## Repository

https://github.com/rahulxgit/ai-inference-playground

---

# Features

## Part A — Inference Playground

* Multi-modal input support

  * Text input
  * Audio input (MediaRecorder API)
* Token-by-token streaming responses using `ReadableStream`
* Real-time metrics

  * Live token count
  * Tokens-per-second throughput
* Graceful mid-stream error handling
* WCAG AA accessibility support
* Fully keyboard navigable interface

---

## Part B — Model Output Diff View

* Side-by-side model comparison
* Token-level diff visualization
* Custom LCS-based diff algorithm implementation
* No external diffing libraries used
* Highlighted insertions/removals at token granularity

---

# Tech Stack

* React
* TypeScript
* Vite
* CSS Design System
* Fetch API
* ReadableStream API
* MediaRecorder API

---

# Architecture Overview

```txt
src/
  components/
    Playground.tsx      Root inference workflow UI
    InputPanel.tsx      Text/audio input handling
    StreamOutput.tsx    Live streamed response rendering
    MetricsBar.tsx      Real-time metrics display
    ErrorBanner.tsx     Mid-stream failure handling
    DiffView.tsx        Token-level model comparison UI

  hooks/
    useStream.ts        Streaming state + ReadableStream handling
    useAudioRecorder.ts Audio recording abstraction

  lib/
    mockApi.ts          Simulated streaming backend
    diff.ts             LCS token diff implementation
```

---

# Streaming Architecture

The inference playground uses the Fetch API with `ReadableStream` to progressively consume model output chunks without waiting for the full response.

Streaming flow:

1. Open fetch request
2. Access stream reader via `response.body.getReader()`
3. Decode chunks using `TextDecoder`
4. Append tokens incrementally to React state
5. Render updates live in the UI

DOM updates are batched using `requestAnimationFrame` to reduce unnecessary render frequency during high-throughput streaming.

This creates a responsive, real-time inference experience similar to modern AI tooling platforms.

---

# Error Handling Strategy

The application is designed to gracefully handle interrupted inference sessions, including:

* Network failures
* Stream interruptions
* Request aborts
* Mid-stream errors

Key behaviors:

* Partial output is always preserved
* Existing streamed tokens are never discarded
* Error states are surfaced through accessible UI banners
* Sessions fail gracefully without blank-screen resets

Abort handling is implemented using `AbortController`.

---

# Accessibility Considerations

The application was designed to meet WCAG AA accessibility standards.

Implemented accessibility features include:

* Full keyboard navigation support
* Visible focus indicators using `:focus-visible`
* Semantic HTML elements
* Screen reader announcements for streamed content
* Accessible labels for all controls
* High-contrast color system
* ARIA live regions for dynamic updates

Examples:

* `role="log"` + `aria-live="polite"` for streamed output
* `role="alert"` for error states
* `role="status"` for live metrics
* `aria-pressed` for toggle buttons
* `aria-selected` for tab navigation

---

# Real-Time Metrics

The metrics system updates continuously during streaming.

Metrics include:

* Live token counter
* Tokens-per-second throughput

Throughput is calculated as:

TPS = tokenCount / elapsedSeconds

The timer begins on the first received token rather than request submission, preventing initial network latency from skewing throughput measurements.

---

# Diff Algorithm — Longest Common Subsequence (LCS)

## Approach

The diff engine performs token-level comparison using a custom implementation of the Longest Common Subsequence (LCS) algorithm.

Both outputs are tokenized using whitespace segmentation before constructing a dynamic programming table.

The DP table stores:

```txt
dp[i][j] = length of the LCS between:
- first i tokens of output A
- first j tokens of output B
```

Backtracking through the table generates token-level operations:

* `same`
* `add`
* `remove`

The UI then highlights changes directly inside each model column.

---

# Time Complexity Analysis

| Operation             | Time Complexity | Space Complexity |
| --------------------- | --------------- | ---------------- |
| DP table construction | O(m × n)        | O(m × n)         |
| Backtracking          | O(m + n)        | O(1)             |

Where:

* `m` = token count of output A
* `n` = token count of output B

For typical model responses (200–500 tokens), the algorithm performs comfortably within browser limits.

---

# Why LCS Was Chosen

## Compared to Myers Diff

Myers diff is optimized for minimal edit scripts and large line-oriented diffs (such as source control systems).

For natural-language model output comparison, token alignment clarity was prioritized over shortest edit distance optimization.

LCS provides:

* simpler implementation,
* easier debugging,
* accurate token alignment,
* sufficient performance for expected input sizes.

---

## Compared to Naive Token Comparison

Naive sequential comparison fails when insertions/deletions shift subsequent tokens.

LCS correctly computes global alignment and avoids cascading false positives.

---

## Compared to Patience Diff

Patience diff performs well on structured code diffs using unique anchor tokens.

Natural-language model output lacks strong structural anchors, reducing the advantages of Patience diff in this context.

---

# Performance Considerations

* Streaming updates are batched with `requestAnimationFrame`
* Render frequency is minimized during token streaming
* UI updates remain responsive under continuous chunk delivery
* Lightweight state structure avoids excessive reconciliation overhead

---

# Local Development

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

---

# Future Improvements

Potential enhancements include:

* Real backend inference integration
* WebSocket-based streaming transport
* Native tokenizer integration
* Streaming markdown rendering
* Virtualized diff rendering for large outputs
* Unit/integration testing coverage

---

# Author

Rahul Kumar

* GitHub: https://github.com/rahulxgit
* LinkedIn: https://www.linkedin.com/in/rahulxnit/

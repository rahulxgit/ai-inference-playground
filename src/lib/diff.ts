import type { DiffToken } from '../types';

/**
 * Tokenize a string into word-level tokens.
 * Splits on whitespace but preserves punctuation attached to words.
 */
export function tokenize(text: string): string[] {
  return text.match(/\S+|\n/g) ?? [];
}

/**
 * Compute the Longest Common Subsequence (LCS) diff between two token arrays.
 *
 * Algorithm: Classic LCS via dynamic programming.
 *   - Build an (m+1) x (n+1) DP table where dp[i][j] = length of LCS of a[0..i-1] and b[0..j-1].
 *   - Backtrack through the table to reconstruct the diff.
 *
 * Time complexity:  O(m × n)
 * Space complexity: O(m × n)
 *
 * Why LCS over alternatives:
 *   - Myers diff: Optimised for line-level diffing (used by git). More complex to implement
 *     correctly for token-level work; overkill for this use case.
 *   - Naive element-by-element: Cannot handle insertions/deletions that shift subsequent tokens.
 *   - LCS: Clean mapping — shared tokens = "same", tokens only in A = "remove",
 *     tokens only in B = "add". Readable, verifiable, and fast enough for model outputs
 *     (typical token counts are in the hundreds, so O(m×n) is negligible).
 */
export function diffTokens(a: string[], b: string[]): DiffToken[] {
  const m = a.length;
  const n = b.length;

  // Build DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to reconstruct the diff sequence
  const result: DiffToken[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ token: a[i - 1], type: 'same' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ token: b[j - 1], type: 'add' });
      j--;
    } else {
      result.unshift({ token: a[i - 1], type: 'remove' });
      i--;
    }
  }

  return result;
}

/**
 * Convenience wrapper: tokenize two strings and diff them.
 */
export function diffTexts(textA: string, textB: string): DiffToken[] {
  return diffTokens(tokenize(textA), tokenize(textB));
}

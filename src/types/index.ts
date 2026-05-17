export type InputMode = 'text' | 'audio';

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface StreamState {
  output: string;
  status: StreamStatus;
  error: string | null;
  tokenCount: number;
  tokensPerSecond: number;
  elapsedMs: number;
}

export interface DiffToken {
  token: string;
  type: 'same' | 'add' | 'remove';
}

export interface ModelOutput {
  modelName: string;
  text: string;
}

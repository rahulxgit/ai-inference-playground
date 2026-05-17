import { useCallback, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'done' | 'error';

export interface AudioRecorderState {
  status: RecorderStatus;
  durationMs: number;
  error: string | null;
  transcript: string | null;
}

export function useAudioRecorder(onTranscript: (text: string) => void) {
  const [state, setState] = useState<AudioRecorderState>({
    status: 'idle',
    durationMs: 0,
    error: null,
    transcript: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());

        // In production: send chunksRef.current to a transcription API.
        // Here we simulate a transcript after a short delay.
        const mockTranscript =
          'Explain how transformer attention mechanisms work.';
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            status: 'done',
            transcript: mockTranscript,
          }));
          onTranscript(mockTranscript);
        }, 600);
      };

      recorder.start(100); // collect data every 100ms

      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          durationMs: Date.now() - startTimeRef.current,
        }));
      }, 100);

      setState({ status: 'recording', durationMs: 0, error: null, transcript: null });
    } catch (err) {
      setState({
        status: 'error',
        durationMs: 0,
        error: 'Microphone access denied.',
        transcript: null,
      });
    }
  }, [onTranscript]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setState({ status: 'idle', durationMs: 0, error: null, transcript: null });
  }, []);

  return { state, start, stop, reset };
}

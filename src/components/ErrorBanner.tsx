// import React from 'react';

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      className="error-banner"
      role="alert"
      aria-live="assertive"
    >
      <div className="error-banner__icon" aria-hidden="true">⚠</div>
      <div className="error-banner__body">
        <p className="error-banner__title">Stream interrupted</p>
        <p className="error-banner__message">{message}</p>
        <p className="error-banner__note">
          Partial output has been preserved above.
        </p>
      </div>
      <button
        className="error-banner__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}

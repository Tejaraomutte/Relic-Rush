import React, { useMemo } from "react";

type ScoreModalProps = {
  isOpen: boolean;
  correct: number;
  total: number;
  percentage: number;
  onRetry: () => void;
  onClose: () => void;
};

export default function ScoreModal({
  isOpen,
  correct,
  total,
  percentage,
  onRetry,
  onClose
}: ScoreModalProps) {
  const isPerfect = useMemo(() => total > 0 && correct === total, [correct, total]);
  const remaining = Math.max(0, total - correct);

  if (!isOpen) return null;

  return (
    <div className="result-modal-overlay" role="dialog" aria-modal="true">
      <div className={`result-modal ${isPerfect ? "result-modal-success" : "result-modal-error"}`}>
        <div className="result-modal-header">
          <div className={`result-icon ${isPerfect ? "icon-success" : "icon-error"}`}>
            {isPerfect ? "\u2713" : "\u2717"}
          </div>
          <h2 className="result-title">Correct Answers</h2>
        </div>

        <div className="result-content">
          <div className="score-section">
            <div className="score-value">{percentage}%</div>
            <div className="score-details">
              Score: {correct} / {total} correct
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: isPerfect ? "#10b981" : "#ef4444"
              }}
            />
          </div>
          {/* Removed correct/incorrect chips */}
        </div>

        <div className="result-actions">
          <button className="btn btn-retry" onClick={onRetry}>
            Retry
          </button>
          <button className="btn btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

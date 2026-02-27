import React, { useMemo } from "react";
import { useTimer } from "../../utils/TimerContext";

export default function Timer() {
  const { timeLeft, isRunning } = useTimer();
  const timeLabel = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  const isWarning = timeLeft > 0 && timeLeft < 120;

  if (!isRunning) {
    return <div className="timer-text">Timer stopped</div>;
  }

  return (
    <div className={`timer-text ${isWarning ? "timer-warning" : ""}`}>
      Time: {timeLabel}
    </div>
  );
}

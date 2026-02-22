import React, { createContext, useContext, useEffect, useState } from "react";

interface TimerContextProps {
  timeLeft: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  setTimeLeft: (seconds: number) => void;
  resetTimer: (seconds?: number) => void;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

const TIMER_DURATION = 1200; // 20 minutes

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const stored = localStorage.getItem("event_timer_timeLeft");
    return stored ? parseInt(stored, 10) : TIMER_DURATION;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const stored = localStorage.getItem("event_timer_isRunning");
    return stored ? stored === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("event_timer_timeLeft", String(timeLeft));
    localStorage.setItem("event_timer_isRunning", String(isRunning));
  }, [timeLeft, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (!isRunning && timeLeft > 0) setIsRunning(true);
  };
  const stopTimer = () => setIsRunning(false);
  const resetTimer = (seconds = TIMER_DURATION) => {
    setTimeLeft(seconds);
    setIsRunning(true);
  };

  return (
    <TimerContext.Provider value={{ timeLeft, isRunning, startTimer, stopTimer, setTimeLeft, resetTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
};

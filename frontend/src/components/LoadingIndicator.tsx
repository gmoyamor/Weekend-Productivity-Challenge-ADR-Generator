"use client";

import { useState, useEffect, useCallback } from "react";

interface LoadingIndicatorProps {
  onTimeout?: () => void;
}

const TIMEOUT_SECONDS = 30;

export default function LoadingIndicator({ onTimeout }: LoadingIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const handleTimeout = useCallback(() => {
    setTimedOut(true);
    onTimeout?.();
  }, [onTimeout]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= TIMEOUT_SECONDS) {
          clearInterval(interval);
          handleTimeout();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleTimeout]);

  if (timedOut) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="h-10 w-10 rounded-full border-4 border-red-200 border-t-red-500" />
        <p className="text-base text-red-600 font-medium">
          La solicitud excedió el tiempo de espera.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-[#232f3e]" />
      <p className="text-base text-zinc-600">
        Generando ADR... ({elapsedSeconds}s)
      </p>
    </div>
  );
}

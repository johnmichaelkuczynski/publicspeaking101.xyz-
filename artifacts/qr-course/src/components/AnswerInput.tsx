import React, { useRef, useState, useEffect, useCallback } from "react";
import { KeystrokeTrace } from "@workspace/api-client-react";

interface AnswerInputProps {
  value: string;
  onChange: (val: string, trace: KeystrokeTrace) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AnswerInput({ value, onChange, placeholder, disabled }: AnswerInputProps) {
  const [sessionValue, setSessionValue] = useState(value);
  
  // Trace state
  const traceRef = useRef<KeystrokeTrace>({
    keystrokeCount: 0,
    eraseCount: 0,
    bulkInsertCount: 0,
    longestBulkInsertChars: 0,
    rewriteSegments: 0,
    durationMs: 0
  });

  const sessionStartRef = useRef<number>(Date.now());
  const lastKeyWasEraseRef = useRef<boolean>(false);

  useEffect(() => {
    setSessionValue(value);
  }, [value]);

  const emitChange = useCallback((newVal: string) => {
    const trace = {
      ...traceRef.current,
      durationMs: Date.now() - sessionStartRef.current
    };
    onChange(newVal, trace);
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const diff = newVal.length - sessionValue.length;

    if (diff > 5) {
      traceRef.current.bulkInsertCount = (traceRef.current.bulkInsertCount || 0) + 1;
      if (diff > (traceRef.current.longestBulkInsertChars || 0)) {
        traceRef.current.longestBulkInsertChars = diff;
      }
    }

    setSessionValue(newVal);
    emitChange(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isErase = e.key === "Backspace" || e.key === "Delete";
    
    if (isErase) {
      traceRef.current.eraseCount += 1;
      if (!lastKeyWasEraseRef.current) {
        traceRef.current.rewriteSegments = (traceRef.current.rewriteSegments || 0) + 1;
      }
      lastKeyWasEraseRef.current = true;
    } else if (e.key.length === 1 || e.key === "Enter") {
      traceRef.current.keystrokeCount += 1;
      lastKeyWasEraseRef.current = false;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <textarea
        value={sessionValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        placeholder={placeholder || "Type your answer here..."}
        disabled={disabled}
        className="w-full min-h-[120px] p-4 bg-card border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-y"
      />
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-muted-foreground">Pasting is disabled.</span>
      </div>
    </div>
  );
}

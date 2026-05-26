import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const KEYBOARDS = {
  Algebra: [
    "x", "y", "z", "a", "b", "c", "=", "≠", "<", ">", "≤", "≥", 
    "+", "-", "·", "÷", "±", "√", "∛", "^2", "^3", "^n", "|x|", "!"
  ],
  Statistics: [
    "μ", "σ", "σ²", "s", "s²", "x̄", "p̂", "P(A)", "P(A|B)", 
    "∑", "∏", "E(X)", "Var(X)", "N(μ,σ²)", "z", "t", "χ²", "F"
  ],
  Calculus: [
    "∫", "∬", "∭", "∮", "d/dx", "∂/∂x", "lim", "→", "∞", 
    "Δ", "∇", "dx", "dy", "dz", "dt", "e", "ln", "log"
  ],
  Discrete: [
    "∀", "∃", "∄", "∴", "∵", "ℕ", "ℤ", "ℚ", "ℝ", "ℂ",
    "≡", "≅", "≈", "∝", "mod", "⌊x⌋", "⌈x⌉", "gcd", "lcm"
  ],
  SetTheory: [
    "∈", "∉", "⊂", "⊆", "⊄", "∪", "∩", "∅", "∖", "×", 
    "A^c", "P(S)", "|S|", "ℵ₀"
  ],
  Logic: [
    "∧", "∨", "¬", "→", "↔", "⊕", "⊤", "⊥", "⊢", "⊨"
  ],
  Trigonometry: [
    "sin", "cos", "tan", "csc", "sec", "cot", "arcsin", "arccos", "arctan",
    "θ", "α", "β", "γ", "φ", "π", "°", "rad"
  ],
  Geometry: [
    "△", "∠", "⊥", "∥", "≅", "∼", "π", "r", "d", "A", "V", "C"
  ]
};

type KeyboardKey = keyof typeof KEYBOARDS;

interface MathKeyboardProps {
  onInsert: (symbol: string) => void;
}

export function MathKeyboard({ onInsert }: MathKeyboardProps) {
  const [activeTabs, setActiveTabs] = useState<KeyboardKey[]>(() => {
    const saved = localStorage.getItem("math-keyboard-tabs");
    return saved ? JSON.parse(saved) : ["Algebra"];
  });

  useEffect(() => {
    localStorage.setItem("math-keyboard-tabs", JSON.stringify(activeTabs));
  }, [activeTabs]);

  const toggleTab = (tab: KeyboardKey) => {
    setActiveTabs(prev => 
      prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab]
    );
  };

  return (
    <div className="bg-secondary/50 border rounded-md p-3 flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {(Object.keys(KEYBOARDS) as KeyboardKey[]).map(tab => (
          <button
            key={tab}
            onClick={() => toggleTab(tab)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              activeTabs.includes(tab) 
                ? "bg-primary text-primary-foreground" 
                : "bg-background text-muted-foreground hover:bg-muted border border-border"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {activeTabs.map(tab => (
          <div key={tab} className="flex flex-col gap-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
              {tab}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {KEYBOARDS[tab].map(symbol => (
                <button
                  key={`${tab}-${symbol}`}
                  onClick={() => onInsert(symbol)}
                  className="min-w-9 h-9 px-2 rounded bg-background border shadow-sm flex items-center justify-center font-mono text-sm hover:bg-muted hover:border-primary/50 transition-all active:scale-95"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        ))}
        {activeTabs.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            Select a keyboard category above to show symbols.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface WhyPanelProps {
  title?: string;
  children: React.ReactNode;
}

export function WhyPanel({ title = "Show the math", children }: WhyPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm text-steel underline-offset-4 hover:text-navy hover:underline"
      >
        {open ? "Hide" : title}
      </button>
      {open && <div className="mt-3 space-y-3 text-sm leading-6 text-navy/90">{children}</div>}
    </div>
  );
}

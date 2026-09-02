"use client";

import katex from "katex";
import { cn } from "@/lib/cn";

interface EquationProps {
  math: string;
  display?: boolean;
  className?: string;
}

export function Equation({ math, display = false, className }: EquationProps) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: display,
  });

  return (
    <span
      className={cn(display && "block overflow-x-auto py-1", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

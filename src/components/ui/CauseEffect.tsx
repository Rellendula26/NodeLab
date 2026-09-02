interface CauseEffectProps {
  text: string;
}

export function CauseEffect({ text }: CauseEffectProps) {
  return (
    <div className="border border-line bg-cream/80 px-4 py-3">
      <p className="text-[11px] tracking-[0.16em] text-crimson uppercase">Cause → effect</p>
      <p className="mt-1 text-sm leading-6 text-navy">{text}</p>
    </div>
  );
}

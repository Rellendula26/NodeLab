import Link from "next/link";
import { SiteHeader } from "./SiteHeader";

interface SimFrameProps {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}

export function SimFrame({ eyebrow, title, lede, children }: SimFrameProps) {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Link href="/" className="text-sm text-steel hover:text-navy">
          ← All simulations
        </Link>
        <p className="mt-6 text-[11px] tracking-[0.18em] text-crimson uppercase">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-navy md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{lede}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

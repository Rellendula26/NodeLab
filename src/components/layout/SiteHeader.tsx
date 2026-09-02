import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 py-4">
        <Link href="/" className="group">
          <p className="text-[11px] tracking-[0.18em] text-steel uppercase">Penn Engineering · ESE 2150</p>
          <p className="font-serif text-2xl tracking-tight text-navy group-hover:text-steel">NodeLab</p>
        </Link>
        <nav className="flex flex-wrap items-center gap-5 text-sm text-steel">
          <Link href="/lab" className="hover:text-navy">
            Core Lab
          </Link>
          <Link href="/#modules" className="hover:text-navy">
            Simulations
          </Link>
          <Link href="/workspace" className="hover:text-navy">
            Node Explorer
          </Link>
        </nav>
      </div>
    </header>
  );
}

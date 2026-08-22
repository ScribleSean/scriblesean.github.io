"use client";

import { useEffect, useState } from "react";

import { nav, site } from "@/lib/site";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-500 ${
        scrolled ? "bg-[#0c0908]/70 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a
          href="#hero"
          className="text-[11px] font-medium uppercase tracking-brand text-[var(--ink)]"
        >
          {site.name}
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href={`mailto:${site.email}`}
          className="text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
        >
          Email
        </a>
      </div>
    </header>
  );
}

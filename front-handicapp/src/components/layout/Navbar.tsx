"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur supports-backdrop-blur:bg-background/60">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-semibold">
              Handicapp
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-foreground/80 hover:text-foreground">
              Inicio
            </Link>
            <Link href="/login" className="text-sm text-foreground/80 hover:text-foreground">
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm rounded-md border border-foreground px-3 py-1.5 hover:bg-foreground/10"
            >
              Registrarse
            </Link>
          </div>
          <button
            aria-label="Abrir menú"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 hover:bg-foreground/10"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Abrir menú</span>
          </button>
        </div>
        {open ? (
          <div className="flex flex-col gap-2 py-2 md:hidden">
            <Link href="/" className="px-2 py-1 rounded hover:bg-foreground/10">
              Inicio
            </Link>
            <Link href="/login" className="px-2 py-1 rounded hover:bg-foreground/10">
              Login
            </Link>
            <Link href="/register" className="px-2 py-1 rounded hover:bg-foreground/10">
              Registrarse
            </Link>
          </div>
        ) : null}
      </nav>
    </header>
  );
}



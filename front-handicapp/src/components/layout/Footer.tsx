export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-foreground/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-xs text-foreground/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Handicapp</span>
        <span className="text-foreground/50">Construido con Next.js</span>
      </div>
    </footer>
  );
}



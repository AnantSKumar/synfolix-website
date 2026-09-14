import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Home", to: "/" },
  { label: "Products", to: "#products" },
  { label: "Solutions", to: "#" },
  { label: "Industries", to: "#industries" },
  { label: "Our Work", to: "#" },
  { label: "About", to: "#" },
  { label: "Contact", to: "#contact" },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="Synfolix" className="h-14 w-auto" />
        </a>

        <nav className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden rounded-full px-4 sm:inline-flex">
            <a href="#contact">Build with Synfolix</a>
          </Button>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-full text-foreground hover:bg-secondary md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
          <Button asChild size="sm" className="mt-4 w-full rounded-full">
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Build with Synfolix
            </a>
          </Button>
        </nav>
      )}
    </header>
  );
}

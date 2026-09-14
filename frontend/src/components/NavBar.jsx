import { useEffect, useRef, useState } from "react";

function LitUpButton({ className = "", children, ...props }) {
  return (
    <a
      {...props}
      className={`group relative shrink-0 rounded-full p-[2px] transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-[#0a3a38] to-primary" />
      <span className="relative flex w-full items-center justify-center rounded-full bg-[#0f2a2c] px-6 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[#0f2a2c]/90">
        {children}
      </span>
    </a>
  );
}

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
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 80) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -8) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md transition-transform duration-300 ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="Synfolix" className="h-20 w-auto" />
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
          <LitUpButton href="#contact" className="hidden sm:inline-block">
            Build with Synfolix
          </LitUpButton>
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
          <LitUpButton href="#contact" onClick={() => setMenuOpen(false)} className="mt-4 block w-full">
            Build with Synfolix
          </LitUpButton>
        </nav>
      )}
    </header>
  );
}

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
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <span className="inline-block size-2.5 rounded-full bg-primary" />
          Synfolix
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="relative transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button asChild size="sm" className="rounded-full px-4">
          <a href="#contact">Build With Synfolix</a>
        </Button>
      </div>
    </header>
  );
}

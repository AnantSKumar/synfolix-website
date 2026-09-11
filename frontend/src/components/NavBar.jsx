import { Link } from "react-router-dom";

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
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          Synfolix
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {links.map((link) => (
            <a key={link.label} href={link.to} className="hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-slate-700"
        >
          Build With Synfolix
        </a>
      </div>
    </header>
  );
}

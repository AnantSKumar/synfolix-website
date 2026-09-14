import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/products", label: "Products" },
  { to: "/industries", label: "Industries" },
  { to: "/leads", label: "Leads" },
];

export default function NavBar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3">
      <div className="flex items-center gap-8">
        <span className="text-sm font-semibold tracking-tight text-slate-900">Synfolix Admin</span>
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-8 items-center justify-center rounded-full bg-teal-700 text-sm font-medium text-white hover:bg-teal-800"
          aria-label="Account menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
          </svg>
        </button>
        {menuOpen && (
          <div
            onMouseLeave={() => setMenuOpen(false)}
            className="absolute right-0 top-10 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            <button
              onClick={logout}
              className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

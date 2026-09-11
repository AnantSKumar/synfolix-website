import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { logout } = useAuth();

  return (
    <nav className="border-b bg-white px-8 py-3 flex justify-between items-center">
      <div className="space-x-6 text-sm font-medium text-slate-700">
        <Link to="/products" className="hover:text-slate-900">
          Products
        </Link>
        <Link to="/industries" className="hover:text-slate-900">
          Industries
        </Link>
        <Link to="/leads" className="hover:text-slate-900">
          Leads
        </Link>
      </div>
      <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
        Log out
      </button>
    </nav>
  );
}

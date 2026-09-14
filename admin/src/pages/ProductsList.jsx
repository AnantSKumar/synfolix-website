import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";
import NavBar from "../components/NavBar";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await apiFetch("/admin/products");
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await apiFetch(`/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
        <Link
          to="/products/new"
          className="bg-teal-700 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-teal-800"
        >
          New product
        </Link>
      </div>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Industry</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.name}</td>
              <td className="py-2">{p.industry}</td>
              <td className="py-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    p.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td className="py-2 space-x-2 text-right">
                <Link
                  to={`/products/${p.id}/edit`}
                  className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

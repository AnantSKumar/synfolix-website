import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";
import NavBar from "../components/NavBar";

export default function IndustriesList() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await apiFetch("/admin/industries");
    setIndustries(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this industry?")) return;
    await apiFetch(`/admin/industries/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Industries</h1>
          <Link
            to="/industries/new"
            className="bg-teal-700 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-teal-800"
          >
            New industry
          </Link>
        </div>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Order</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {industries.map((ind) => (
              <tr key={ind.id} className="border-b">
                <td className="py-2">{ind.name}</td>
                <td className="py-2">{ind.displayOrder}</td>
                <td className="py-2 space-x-2 text-right">
                  <Link
                    to={`/industries/${ind.id}/edit`}
                    className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(ind.id)}
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

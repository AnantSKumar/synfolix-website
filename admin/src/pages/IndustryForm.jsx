import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";
import NavBar from "../components/NavBar";

const emptyIndustry = { slug: "", name: "", description: "", icon: "", displayOrder: 0 };

export default function IndustryForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [industry, setIndustry] = useState(emptyIndustry);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      apiFetch("/admin/industries").then((all) => {
        const existing = all.find((i) => String(i.id) === id);
        if (existing) setIndustry(existing);
      });
    }
  }, [id, isEditing]);

  function handleChange(field, value) {
    setIndustry((prev) => ({ ...prev, [field]: value }));
  }

  function slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { ...industry, displayOrder: Number(industry.displayOrder) };

    try {
      if (isEditing) {
        await apiFetch(`/admin/industries/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/admin/industries", { method: "POST", body: JSON.stringify(payload) });
      }

      navigate("/industries");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">
          {isEditing ? "Edit Industry" : "New Industry"}
        </h1>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.name}
              onChange={(e) => {
                const name = e.target.value;
                handleChange("name", name);
                if (!isEditing) handleChange("slug", slugify(name));
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              value={industry.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Icon (name or URL)
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.displayOrder}
              onChange={(e) => handleChange("displayOrder", e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-teal-700 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-teal-800"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
}

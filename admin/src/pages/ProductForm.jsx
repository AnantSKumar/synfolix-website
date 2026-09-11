import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

const emptyProduct = {
  slug: "",
  name: "",
  industry: "",
  tagline: "",
  description: "",
  keyFeatures: [],
  screenshots: [],
  status: "draft",
};

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [product, setProduct] = useState(emptyProduct);
  const [featuresText, setFeaturesText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      apiFetch(`/admin/products`).then((all) => {
        const existing = all.find((p) => String(p.id) === id);
        if (existing) {
          setProduct(existing);
          setFeaturesText((existing.keyFeatures || []).join("\n"));
        }
      });
    }
  }, [id, isEditing]);

  function handleChange(field, value) {
    setProduct((prev) => ({ ...prev, [field]: value }));
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
    const payload = {
      ...product,
      keyFeatures: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    try {
      if (isEditing) {
        await apiFetch(`/admin/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      navigate("/products");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        {isEditing ? "Edit Product" : "New Product"}
      </h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.name}
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
            value={product.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
            value={product.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Key Features (one per line)
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-slate-800 text-white rounded px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}

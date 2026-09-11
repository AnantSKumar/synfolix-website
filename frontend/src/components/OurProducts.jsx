import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import ProductCard from "./ProductCard";

export default function OurProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/products")
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="products" className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Our Products</h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
          Software products built and owned by Synfolix, serving real industries today.
        </p>
        {loading && <p className="text-center text-slate-400">Loading products...</p>}
        {!loading && products.length === 0 && (
          <p className="text-center text-slate-400">More products coming soon.</p>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

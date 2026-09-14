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
    <section id="products" className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold text-foreground">Our products</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Software products built and owned by Synfolix, serving real industries today.
          </p>
        </div>
        {loading && <p className="mt-10 text-sm text-muted-foreground">Loading products…</p>}
        {!loading && products.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">More products coming soon.</p>
        )}
        <div className="mt-10 grid gap-px overflow-hidden bg-border md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

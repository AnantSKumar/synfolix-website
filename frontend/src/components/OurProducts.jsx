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
    <section id="products" className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-foreground">Our Products</h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          Software products built and owned by Synfolix, serving real industries today.
        </p>
        {loading && <p className="text-center text-muted-foreground">Loading products...</p>}
        {!loading && products.length === 0 && (
          <p className="text-center text-muted-foreground">More products coming soon.</p>
        )}
        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

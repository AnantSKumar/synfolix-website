import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function Industries() {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    apiFetch("/industries").then(setIndustries).catch(() => setIndustries([]));
  }, []);

  return (
    <section id="industries" className="border-b border-border bg-secondary/60 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-foreground">Industries</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {industries.map((industry) => (
            <div
              key={industry.slug}
              className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <h3 className="font-medium text-foreground">{industry.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

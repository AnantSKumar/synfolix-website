import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function Industries() {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    apiFetch("/industries").then(setIndustries).catch(() => setIndustries([]));
  }, []);

  return (
    <section id="industries" className="border-b border-border bg-secondary px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-foreground">Industries</h2>
        <div className="mt-10 divide-y divide-border border-t border-border">
          {industries.map((industry) => (
            <div
              key={industry.slug}
              className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:items-baseline sm:gap-6"
            >
              <h3 className="font-medium text-foreground">{industry.name}</h3>
              <p className="text-sm text-muted-foreground">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

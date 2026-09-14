import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function Industries() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/industries")
      .then(setIndustries)
      .catch(() => setIndustries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="industries" className="border-b border-border bg-secondary/60 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold text-foreground">Industries</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Software built to fit the way each industry actually works.
          </p>
        </div>

        {loading && <p className="mt-10 text-sm text-muted-foreground">Loading industries…</p>}
        {!loading && industries.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">More industries coming soon.</p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {industries.map((industry) => (
            <div
              key={industry.slug}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div className="h-1 bg-primary/25 transition-colors group-hover:bg-primary" />
              <div className="p-5">
                <h3 className="font-medium text-foreground">{industry.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{industry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

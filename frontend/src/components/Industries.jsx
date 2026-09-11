import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function Industries() {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    apiFetch("/industries").then(setIndustries).catch(() => setIndustries([]));
  }, []);

  return (
    <section id="industries" className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Industries</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {industries.map((industry) => (
            <div
              key={industry.slug}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-slate-900">{industry.name}</h3>
              <p className="text-sm text-slate-500 mt-2">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

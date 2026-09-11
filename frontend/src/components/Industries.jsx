import { useEffect, useState } from "react";
import { HeartPulse, Scale, GraduationCap, Users, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { apiFetch } from "../lib/apiClient";

const ICONS = {
  healthcare: HeartPulse,
  legal: Scale,
  education: GraduationCap,
  crm: Users,
};

export default function Industries() {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    apiFetch("/industries").then(setIndustries).catch(() => setIndustries([]));
  }, []);

  return (
    <section id="industries" className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Industries</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {industries.map((industry) => {
            const Icon = ICONS[industry.slug] || Building2;
            return (
              <Card
                key={industry.slug}
                className="items-center p-6 text-center shadow-none transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">{industry.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{industry.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

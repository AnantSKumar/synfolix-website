import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const journey = ["Idea", "Strategy", "Design", "Development", "Testing", "Launch", "Scale"];

const services = [
  "Custom software", "SaaS platforms", "Web applications", "Mobile applications",
  "CRM systems", "ERP systems", "AI solutions", "Business automation",
  "Dashboards", "APIs", "Integrations", "MVP development",
];

export default function BuildWithSynfolix() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
        Have an idea? We'll build it with you.
      </h2>
      <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
        Synfolix designs, builds, and scales software for businesses, startups, and
        entrepreneurs.
      </p>
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
        {journey.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-4 py-2 text-accent-foreground">{step}</span>
            {i < journey.length - 1 && <span className="text-primary/40">→</span>}
          </span>
        ))}
      </div>
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {services.map((service) => (
          <Badge key={service} variant="outline" className="px-4 py-2 text-sm font-normal text-muted-foreground">
            {service}
          </Badge>
        ))}
      </div>
      <div className="text-center">
        <Button asChild size="lg" className="rounded-full px-6">
          <a href="#contact">Tell Us What You're Building</a>
        </Button>
      </div>
    </section>
  );
}

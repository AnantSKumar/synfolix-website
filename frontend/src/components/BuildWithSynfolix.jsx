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
    <section className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Have an idea? We&rsquo;ll build it with you.
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Synfolix designs, builds, and scales software for businesses, startups, and
              entrepreneurs.
            </p>
            <Button asChild size="lg" className="mt-8 rounded-sm px-6">
              <a href="#contact">Tell us what you&rsquo;re building</a>
            </Button>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm font-medium text-foreground">
              {journey.map((step, i) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span>{step}</span>
                  {i < journey.length - 1 && <span className="text-muted-foreground">→</span>}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {services.map((service) => (
                <Badge key={service} variant="outline" className="rounded-sm font-normal text-muted-foreground">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

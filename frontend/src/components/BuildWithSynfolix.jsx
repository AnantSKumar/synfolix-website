import { Badge } from "@/components/ui/badge";

const journey = ["Idea", "Strategy", "Design", "Development", "Testing", "Launch", "Scale"];

const services = [
  "Custom software", "SaaS platforms", "Web applications", "Mobile applications",
  "CRM systems", "ERP systems", "AI solutions", "Business automation",
  "Dashboards", "APIs", "Integrations", "MVP development",
];

export default function BuildWithSynfolix() {
  return (
    <section className="relative overflow-hidden border-b border-border px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex justify-start pr-16">
          <span className="h-px w-12 bg-primary" />
        </div>
        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Have an idea? We&rsquo;ll build it with you.
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Synfolix designs, builds, and scales software for businesses, startups, and
              entrepreneurs.
            </p>
            <a
              href="#contact"
              className="group relative mt-8 inline-block rounded-full bg-[#0f2a2c] px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:shadow-xl hover:shadow-[#0a3a38]/50"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 -top-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
              Tell us what you&rsquo;re building
            </a>
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
                <Badge
                  key={service}
                  variant="outline"
                  className="rounded-full border-primary/25 bg-primary/8 font-normal text-primary"
                >
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-14 flex justify-end pl-16">
          <span className="h-px w-12 bg-primary" />
        </div>
      </div>
    </section>
  );
}

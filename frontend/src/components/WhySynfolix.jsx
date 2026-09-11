import { Lightbulb, Building2, Cpu, Workflow, TrendingUp } from "lucide-react";

const reasons = [
  { icon: Lightbulb, title: "Product Thinking", body: "We think beyond simply writing code." },
  { icon: Building2, title: "Built Around Your Business", body: "Solutions designed around actual business requirements." },
  { icon: Cpu, title: "Modern Technology", body: "AI, cloud, automation and scalable architecture." },
  { icon: Workflow, title: "End-to-End Development", body: "From idea and design through development and launch." },
  { icon: TrendingUp, title: "Built to Scale", body: "Products designed for future growth." },
];

export default function WhySynfolix() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Why Synfolix?</h2>
      <div className="grid gap-8 md:grid-cols-5">
        {reasons.map(({ icon: Icon, title, body }) => (
          <div key={title} className="text-center">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

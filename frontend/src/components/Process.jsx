import { Timeline } from "@/components/ui/timeline";

const steps = [
  { n: "01", title: "Discover", body: "Understand the business, users and requirements." },
  { n: "02", title: "Define", body: "Develop the product strategy and roadmap." },
  { n: "03", title: "Design", body: "Create the UX/UI and product experience." },
  { n: "04", title: "Build", body: "Develop and test the product." },
  { n: "05", title: "Launch", body: "Deploy and launch the product." },
  { n: "06", title: "Scale", body: "Improve, maintain and scale the product." },
];

const data = steps.map((step) => ({
  title: step.title,
  content: (
    <div className="flex items-start gap-3">
      <span className="font-mono text-xs text-primary">{step.n}</span>
      <p className="text-sm text-white/60 md:text-base">{step.body}</p>
    </div>
  ),
}));

export default function Process() {
  return (
    <section className="atmosphere-bg border-b border-primary/30 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-white">Our process</h2>
      </div>
      <Timeline data={data} />
    </section>
  );
}

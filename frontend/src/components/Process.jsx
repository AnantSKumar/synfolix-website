const steps = [
  { n: "01", title: "Discover", body: "Understand the business, users and requirements." },
  { n: "02", title: "Define", body: "Develop the product strategy and roadmap." },
  { n: "03", title: "Design", body: "Create the UX/UI and product experience." },
  { n: "04", title: "Build", body: "Develop and test the product." },
  { n: "05", title: "Launch", body: "Deploy and launch the product." },
  { n: "06", title: "Scale", body: "Improve, maintain and scale the product." },
];

export default function Process() {
  return (
    <section className="border-b border-primary/30 bg-[oklch(0.18_0.02_240)] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-white">Our process</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((step) => (
            <div key={step.n} className="border-t-2 border-primary pt-4">
              <span className="font-mono text-xs text-primary">{step.n}</span>
              <h3 className="mt-2 font-medium text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm text-white/50">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

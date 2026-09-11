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
    <section className="bg-zinc-950 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">Our Process</h2>
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((step) => (
            <div key={step.n} className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                {step.n}
              </div>
              <h3 className="mb-1 font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section className="bg-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Process</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          {steps.map((step) => (
            <div key={step.n} className="text-center">
              <div className="text-4xl font-bold text-slate-700 mb-2">{step.n}</div>
              <h3 className="text-white font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

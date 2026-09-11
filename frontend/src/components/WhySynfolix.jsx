const reasons = [
  { title: "Product Thinking", body: "We think beyond simply writing code." },
  { title: "Built Around Your Business", body: "Solutions designed around actual business requirements." },
  { title: "Modern Technology", body: "AI, cloud, automation and scalable architecture." },
  { title: "End-to-End Development", body: "From idea and design through development and launch." },
  { title: "Built to Scale", body: "Products designed for future growth." },
];

export default function WhySynfolix() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Synfolix?</h2>
      <div className="grid md:grid-cols-5 gap-6">
        {reasons.map((reason) => (
          <div key={reason.title} className="text-center">
            <h3 className="font-semibold text-slate-900 mb-2">{reason.title}</h3>
            <p className="text-sm text-slate-500">{reason.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

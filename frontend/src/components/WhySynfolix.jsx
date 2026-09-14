const reasons = [
  { title: "Product thinking", body: "We think beyond simply writing code." },
  { title: "Built around your business", body: "Solutions designed around actual business requirements." },
  { title: "Modern technology", body: "AI, cloud, automation and scalable architecture." },
  { title: "End-to-end development", body: "From idea and design through development and launch." },
  { title: "Built to scale", body: "Products designed for future growth." },
];

export default function WhySynfolix() {
  return (
    <section className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-foreground">Why Synfolix</h2>
        <div className="mt-10 grid divide-y divide-border border-t border-border md:grid-cols-5 md:divide-x md:divide-y-0 md:border-b">
          {reasons.map((reason, i) => (
            <div key={reason.title} className="py-6 md:px-6 md:py-8 md:first:pl-0">
              <span className="font-heading text-3xl font-semibold text-primary/20">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-medium text-foreground">{reason.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{reason.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

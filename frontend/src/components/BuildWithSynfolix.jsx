const journey = ["Idea", "Strategy", "Design", "Development", "Testing", "Launch", "Scale"];

const services = [
  "Custom software", "SaaS platforms", "Web applications", "Mobile applications",
  "CRM systems", "ERP systems", "AI solutions", "Business automation",
  "Dashboards", "APIs", "Integrations", "MVP development",
];

export default function BuildWithSynfolix() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
        Have an idea? We'll build it with you.
      </h2>
      <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
        Synfolix designs, builds, and scales software for businesses, startups, and
        entrepreneurs.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-sm font-medium text-slate-700">
        {journey.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className="bg-slate-100 rounded-full px-4 py-2">{step}</span>
            {i < journey.length - 1 && <span className="text-slate-300">→</span>}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {services.map((service) => (
          <span
            key={service}
            className="border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600"
          >
            {service}
          </span>
        ))}
      </div>
      <div className="text-center">
        <a
          href="#contact"
          className="bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-slate-700"
        >
          Tell Us What You're Building
        </a>
      </div>
    </section>
  );
}

export default function WhatIsSynfolix() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <p className="text-center text-lg text-slate-700 max-w-3xl mx-auto mb-12">
        Synfolix is a software and technology company building digital products for modern
        businesses.
      </p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Our Products</h3>
          <p className="text-slate-600">
            Software products developed and owned by Synfolix — built for real industries,
            sold and supported directly.
          </p>
        </div>
        <div className="border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Custom Software</h3>
          <p className="text-slate-600">
            Digital products and software developed for third-party businesses, startups,
            and organizations.
          </p>
        </div>
      </div>
    </section>
  );
}

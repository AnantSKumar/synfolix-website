export default function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
        We build digital products that solve real business problems.
      </h1>
      <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
        From our own software products to custom platforms built for businesses, Synfolix
        designs, develops and scales digital solutions across industries.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <a
          href="#products"
          className="bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-slate-700"
        >
          Explore Our Products
        </a>
        <a
          href="#contact"
          className="border border-slate-300 text-slate-800 text-sm font-medium px-6 py-3 rounded-full hover:border-slate-500"
        >
          Build With Synfolix
        </a>
      </div>
    </section>
  );
}

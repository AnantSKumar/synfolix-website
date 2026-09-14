import { CloudShader } from "@/components/ui/cloud-shader";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0f2a2c]">
      <div className="absolute inset-0">
        <CloudShader
          className="h-full"
          count={6}
          cloudColor="#f4f7f6"
          skyTopColor="#0f2a2c"
          skyBottomColor="#1a6e68"
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-28 pt-28 text-center md:pt-36">
        <span className="reveal rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
          The sky&rsquo;s the limit at Synfolix
        </span>
        <h1
          className="hero-gradient-text mt-6 text-[2.75rem] font-semibold leading-[1.06] tracking-tight md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          We build digital products that solve real business problems.
        </h1>
        <p
          className="reveal mt-6 max-w-xl text-lg text-white/80"
          style={{ animationDelay: "160ms" }}
        >
          From our own software products to custom platforms built for businesses, Synfolix
          designs, develops and scales digital solutions across industries.
        </p>
        <div
          className="reveal mt-10 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href="#products"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Explore our products
          </a>
          <a
            href="#contact"
            className="rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Build with Synfolix
          </a>
        </div>
      </div>

      <div aria-hidden className="hero-fade-bottom absolute inset-x-0 bottom-0 z-10 h-24" />
    </section>
  );
}

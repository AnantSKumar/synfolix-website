import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="border-b border-border px-6 pb-20 pt-16 md:pt-20">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_18rem]">
        <div className="pt-6">
          <p className="mb-6 text-sm font-medium text-primary">Synfolix / Technology &amp; Product</p>
          <h1 className="max-w-3xl text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            We build digital products that solve real business problems.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            From our own software products to custom platforms built for businesses, Synfolix
            designs, develops and scales digital solutions across industries.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="rounded-sm px-6">
              <a href="#products">Explore our products</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm px-6">
              <a href="#contact">Build with Synfolix</a>
            </Button>
          </div>
        </div>
        <dl className="flex flex-col justify-between gap-6 bg-[oklch(0.18_0.02_240)] p-7 text-sm">
          <div>
            <dt className="text-white/50">Model</dt>
            <dd className="mt-1.5 border-t border-primary/40 pt-1.5 font-medium text-white">
              Products &amp; custom builds
            </dd>
          </div>
          <div>
            <dt className="text-white/50">Reach</dt>
            <dd className="mt-1.5 border-t border-primary/40 pt-1.5 font-medium text-white">
              Multi-industry
            </dd>
          </div>
          <div>
            <dt className="text-white/50">Focus</dt>
            <dd className="mt-1.5 border-t border-primary/40 pt-1.5 font-medium text-white">
              Engineering-led
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

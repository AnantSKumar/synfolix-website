import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border px-6 pb-24 pt-24 md:pt-32">
      <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <Badge
          variant="secondary"
          className="reveal rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
        >
          Multi-industry software &amp; product studio
        </Badge>
        <h1
          className="reveal mt-6 text-[2.75rem] font-semibold leading-[1.06] tracking-tight text-foreground md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          We build digital products that solve real business problems.
        </h1>
        <p
          className="reveal mt-6 max-w-xl text-lg text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          From our own software products to custom platforms built for businesses, Synfolix
          designs, develops and scales digital solutions across industries.
        </p>
        <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "240ms" }}>
          <Button asChild size="lg" className="gap-2 rounded-full pl-2 pr-6">
            <a href="#products">
              <img src="/logo.png" alt="" className="h-7 w-7 rounded-full bg-white/15 object-contain p-0.5" />
              Explore our products
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6">
            <a href="#contact">Build with Synfolix</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

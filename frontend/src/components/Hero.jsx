import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-28 pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[36rem] w-[72rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-6 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Software · Technology · Product
        </Badge>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
          We build digital products that solve real business problems.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          From our own software products to custom platforms built for businesses, Synfolix
          designs, develops and scales digital solutions across industries.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full px-6">
            <a href="#products">
              Explore Our Products
              <ArrowRight />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6">
            <a href="#contact">Build With Synfolix</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

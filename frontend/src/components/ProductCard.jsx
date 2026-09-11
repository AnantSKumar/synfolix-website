import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }) {
  const screenshot = product.screenshots && product.screenshots[0];

  return (
    <Card className="overflow-hidden py-0 shadow-none transition-shadow hover:shadow-md">
      <div className="flex aspect-video items-center justify-center bg-accent text-sm text-accent-foreground/60">
        {screenshot ? (
          <img src={screenshot.url} alt={screenshot.alt} className="h-full w-full object-cover" />
        ) : (
          "Screenshot coming soon"
        )}
      </div>
      <CardContent className="py-6">
        <Badge variant="secondary" className="uppercase tracking-wide">
          {product.industry}
        </Badge>
        <h3 className="mt-2 text-lg font-semibold text-foreground">{product.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-4 flex items-center gap-4 text-sm font-medium">
          <span className="flex items-center gap-1 text-primary">
            Learn more
            <ArrowRight className="size-3.5" />
          </span>
          <span className="text-muted-foreground">Request Demo</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductCard({ product }) {
  const screenshot = product.screenshots && product.screenshots[0];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="flex aspect-video items-center justify-center bg-secondary text-sm text-muted-foreground">
        {screenshot ? (
          <img src={screenshot.url} alt={screenshot.alt} className="h-full w-full object-cover" />
        ) : (
          "Screenshot coming soon"
        )}
      </div>
      <div className="p-6">
        <p className="font-mono text-xs text-primary">{product.industry}</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">{product.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-5 flex gap-5 text-sm font-medium">
          <span className="text-primary">Learn more</span>
          <span className="text-muted-foreground">Request demo</span>
        </div>
      </div>
    </div>
  );
}

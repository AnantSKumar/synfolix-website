export default function ProductCard({ product }) {
  const screenshot = product.screenshots && product.screenshots[0];

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
        {screenshot ? (
          <img src={screenshot.url} alt={screenshot.alt} className="w-full h-full object-cover" />
        ) : (
          "Screenshot coming soon"
        )}
      </div>
      <div className="p-6">
        <span className="text-xs uppercase tracking-wide text-slate-400">{product.industry}</span>
        <h3 className="text-lg font-semibold text-slate-900 mt-1">{product.name}</h3>
        <p className="text-sm text-slate-600 mt-2">{product.tagline}</p>
        <div className="mt-4 flex gap-4 text-sm font-medium">
          <span className="text-slate-800">Learn more</span>
          <span className="text-slate-500">Request Demo</span>
        </div>
      </div>
    </div>
  );
}

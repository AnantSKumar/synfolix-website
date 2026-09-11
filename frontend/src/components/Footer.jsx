const groups = [
  { title: "Company", items: ["About", "Careers", "Contact"] },
  { title: "Products", items: ["All Products", "Product Categories"] },
  {
    title: "Solutions",
    items: ["Custom Software", "SaaS Development", "Mobile Development", "Web Development", "AI Solutions", "Business Automation"],
  },
  { title: "Industries", items: ["Healthcare", "Legal", "Education"] },
  { title: "Resources", items: ["Case Studies", "Blog", "Insights"] },
  { title: "Legal", items: ["Privacy Policy", "Terms & Conditions", "Cookie Policy"] },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-primary/20 bg-zinc-950 text-zinc-400">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-3 text-sm font-semibold text-white">{group.title}</h4>
            <ul className="space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-primary">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Synfolix Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}

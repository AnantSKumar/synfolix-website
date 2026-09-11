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
    <footer className="bg-slate-900 text-slate-300 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-white text-sm font-semibold mb-3">{group.title}</h4>
            <ul className="space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Synfolix Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}

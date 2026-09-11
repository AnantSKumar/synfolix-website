import { Package, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const pillars = [
  {
    icon: Package,
    title: "Our Products",
    body: "Software products developed and owned by Synfolix — built for real industries, sold and supported directly.",
  },
  {
    icon: Wrench,
    title: "Custom Software",
    body: "Digital products and software developed for third-party businesses, startups, and organizations.",
  },
];

export default function WhatIsSynfolix() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-foreground">
        Synfolix is a software and technology company building digital products for modern
        businesses.
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        {pillars.map(({ icon: Icon, title, body }) => (
          <Card key={title} size="default" className="p-8 shadow-none">
            <CardHeader className="px-0">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </div>
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

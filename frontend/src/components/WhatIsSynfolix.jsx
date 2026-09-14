export default function WhatIsSynfolix() {
  return (
    <section className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="max-w-2xl text-xl leading-snug text-foreground md:text-2xl">
          Synfolix is a software and technology company building digital products for modern
          businesses.
        </p>
        <div className="mt-14 grid gap-10 md:grid-cols-2 md:divide-x md:divide-border">
          <div className="md:pr-10">
            <h3 className="text-lg font-semibold text-foreground">Our products</h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              Software products developed and owned by Synfolix — built for real industries,
              sold and supported directly.
            </p>
          </div>
          <div className="md:pl-10">
            <h3 className="text-lg font-semibold text-foreground">Custom software</h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              Digital products and software developed for third-party businesses, startups,
              and organizations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

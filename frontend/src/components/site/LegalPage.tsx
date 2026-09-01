import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-navy-foreground/70">Last updated: {updated}</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:space-y-1">
          {children}
        </div>
      </section>
    </div>
  );
}

import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/" as const, label: "Home" },
  { to: "/blog" as const, label: "Blog" },
  { to: "/ecosystem" as const, label: "Ecosystem" },
  { to: "/pricing" as const, label: "Pricing" },
];

const externalNavItems = [
  { href: "/journal/the-master-plan", label: "The Master Plan", featured: true },
];


export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3 font-serif text-xl text-foreground">
          <span aria-hidden="true">🪔</span>
          <span className="font-semibold text-primary">Weddings.io Technologies</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

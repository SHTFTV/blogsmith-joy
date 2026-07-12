import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { BuildBadge } from "../components/BuildBadge";
import { PricingVersionBanner } from "../components/PricingVersionBanner";
import { BUILD_CACHE_BUSTER } from "../lib/buildInfo";

function NotFoundComponent() {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isAdminPath = pathname.startsWith("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {isAdminPath ? "Admin page not found" : "Page not found"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAdminPath
            ? "This admin route doesn't exist on the currently deployed build. Try the verification page instead."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isAdminPath && (
            <Link
              to="/admin/verify"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to /admin/verify
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Weddings.io | South Asian Wedding Intelligence" },
      { name: "description", content: "The original South Asian wedding platform with planning intelligence, vendor infrastructure, and expert industry analysis since 2015." },
      { name: "author", content: "Weddings.io" },
      { property: "og:title", content: "Weddings.io | South Asian Wedding Intelligence" },
      { property: "og:description", content: "Planning intelligence, vendor infrastructure, and expert South Asian wedding industry analysis." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Weddings.io" },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Weddings.io — The Original Multicultural Wedding Platform, Est. 2015" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@weddingsio" },
      { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
    ],


    links: [
      {
        rel: "stylesheet",
        href: `${appCss}?v=${BUILD_CACHE_BUSTER}`,
      },
      { rel: "icon", href: "/favicon.svg" },
      { rel: "alternate", type: "application/rss+xml", title: "Weddings.io Blog RSS", href: "/rss.xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <script src="/iam-floater.js" defer />
      </body>

    </html>
  );
}

function RootComponent() {
  return (
    <>
      <PricingVersionBanner />
      <Outlet />
      <BuildBadge />
    </>
  );
}

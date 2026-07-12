import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/journal/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/blog/$slug", params: { slug: params.slug } });
  },
});
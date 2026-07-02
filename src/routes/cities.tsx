import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cities")({
  beforeLoad: () => {
    throw redirect({ href: "/cities/index.html" });
  },
});
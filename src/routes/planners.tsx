import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/planners")({
  beforeLoad: () => {
    throw redirect({ href: "/pricing" });
  },
});
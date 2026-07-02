import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/talc")({
  beforeLoad: () => {
    throw redirect({ href: "/pricing" });
  },
});
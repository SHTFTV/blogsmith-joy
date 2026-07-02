import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/backlinks")({
  beforeLoad: () => {
    throw redirect({ href: "/pricing" });
  },
});
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/guest-list")({
  beforeLoad: () => {
    throw redirect({ href: "/tools" });
  },
});
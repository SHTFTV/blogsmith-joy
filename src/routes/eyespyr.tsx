import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/eyespyr")({
  beforeLoad: () => {
    throw redirect({ href: "/ai" });
  },
});
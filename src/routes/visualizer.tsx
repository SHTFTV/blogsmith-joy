import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/visualizer")({
  beforeLoad: () => {
    throw redirect({ href: "/visualizer/index.html" });
  },
});
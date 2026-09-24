import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/advisors")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/advisors"!</div>;
}

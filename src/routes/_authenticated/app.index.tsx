import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/")({
  beforeLoad: () => { throw redirect({ to: "/_authenticated/app/email" }); },
});

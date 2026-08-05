import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: "/admin",
  SECRETARY: "/secretary",
  TEACHER: "/teacher",
  PARENT: "/parent",
  STUDENT: "/student",
};

export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;
  const dest = ROLE_ROUTES[role] || "/login";
  redirect(dest);
}

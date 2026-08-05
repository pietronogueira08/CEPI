import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        role={user.role}
        userName={user.name || "Usuário"}
        userInitials={initials}
      />
      <div className="main-content" style={{ flex: 1 }}>
        {/* Mobile top padding */}
        <div className="lg:hidden" style={{ height: 56 }} />
        {children}
      </div>
    </div>
  );
}

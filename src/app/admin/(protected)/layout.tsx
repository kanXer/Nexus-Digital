import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  if (!adminEmail) {
    redirect("/admin");
  }

  return (
    <div className="bg-black relative min-h-screen lg:pl-64">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[500px] h-[400px] bg-brand-blue/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] bg-brand-blue/5 blur-[120px] rounded-full" />
      </div>
      <AdminSidebar />
      <main className="relative min-h-screen">{children}</main>
    </div>
  );
}

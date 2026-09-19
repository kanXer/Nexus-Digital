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
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] relative min-h-screen lg:pl-64 transition-colors duration-300">
      {/* Ambient glass background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 right-10 w-[550px] h-[450px] bg-gradient-to-br from-red-600/15 via-rose-500/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-20 w-[450px] h-[400px] bg-gradient-to-tr from-purple-600/10 via-pink-600/5 to-transparent blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-t from-red-600/10 via-amber-500/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-nexus-constellation opacity-[0.03] dark:opacity-[0.07]" />
      </div>

      <AdminSidebar />
      <main className="relative z-10 min-h-screen p-3.5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}

import { AppNav } from "@/components/app-nav";
import { requireUser } from "@/lib/auth/guards";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f1]">
      <AppNav
        displayName={user.displayName}
        username={user.username}
        role={user.role}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
      <footer className="border-t border-slate-200/80 px-4 py-6 text-center text-xs text-slate-500">
        JCA Mock Exam · {new Date().getFullYear()} · Private practice space
      </footer>
    </div>
  );
}

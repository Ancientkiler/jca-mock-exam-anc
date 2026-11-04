import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth/guards";
import { EXAM_PATTERN, SECTIONS, TOTAL_QUESTIONS } from "@/lib/exam/pattern";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/");

  const { next } = await searchParams;

  return (
    <main className="grid min-h-screen bg-[#f7f6f1] lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#12211c] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(16,185,129,0.35), transparent 45%), radial-gradient(circle at 85% 75%, rgba(245,158,11,0.25), transparent 50%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-400 text-base font-bold text-emerald-950">
              J
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">JCA Mock Exam</p>
              <p className="text-xs text-emerald-100/70">
                Supreme Court of India · Junior Court Assistant
              </p>
            </div>
          </div>

          <h1 className="mt-16 max-w-lg font-serif text-4xl font-semibold leading-[1.12] tracking-tight sm:text-[2.9rem]">
            Practice the real paper.
            <span className="block text-emerald-300">Measure what matters.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-emerald-50/75">
            Full mocks on the 2026 pattern, focused drills, a searchable question
            bank, and an honest record of every attempt.
          </p>
        </div>

        <div className="relative grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Questions", value: String(TOTAL_QUESTIONS) },
              { label: "Minutes", value: String(EXAM_PATTERN.durationSec / 60) },
              { label: "Sections", value: String(SECTIONS.length) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
              >
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-100/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-emerald-100/50">
            Marking · +1 correct · −0.25 wrong · 0 skipped
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-[#12211c] text-base font-bold text-white">
              J
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">JCA Mock Exam</p>
              <p className="text-xs text-slate-500">Junior Court Assistant</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Use the account provided to you. There is no public registration.
          </p>

          <div className="mt-7">
            <LoginForm nextPath={next} />
          </div>

          <p className="mt-8 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-xs leading-5 text-slate-500">
            Five practice accounts and one administrator account are pre-created.
            If you cannot sign in, contact the administrator.
          </p>
        </div>
      </section>
    </main>
  );
}

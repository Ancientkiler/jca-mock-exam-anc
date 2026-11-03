export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
        JCA Mock Exam
      </p>
      <h1 className="text-3xl font-bold text-slate-900">
        Project scaffold is ready
      </h1>
      <p className="text-slate-600">
        The source project is set up. MongoDB credentials are needed before the
        exam, accounts, and admin dashboard can be built and verified.
      </p>
    </main>
  );
}

import { StartMockButton } from "@/components/start-mock-button";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { EXAM_PATTERN, SECTION_IDS, sectionName } from "@/lib/exam/pattern";
import { getSectionCounts } from "@/lib/exam/queries";

export const dynamic = "force-dynamic";

export default async function NewMockPage() {
  await requireUser();
  const counts = await getSectionCounts();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="New paper"
        title="Build a full mock"
        description="Every paper is assembled fresh. Nothing is reused in the same order twice."
        action={<StartMockButton />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Exam pattern</h2>
          <p className="mt-1 text-sm text-slate-600">
            {EXAM_PATTERN.durationSec / 60} minutes for 100 questions. The paper
            auto-submits when the clock reaches zero.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Section</th>
                  <th className="px-4 py-2.5 text-right font-medium">Questions</th>
                  <th className="px-4 py-2.5 text-right font-medium">In bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EXAM_PATTERN.sections.map((section) => (
                  <tr key={section.id}>
                    <td className="px-4 py-2.5 text-slate-800">
                      {sectionName(section.id)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                      {section.count}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                      {counts[section.id] ?? 0}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/70 font-medium">
                  <td className="px-4 py-2.5 text-slate-900">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                    {EXAM_PATTERN.sections.reduce((sum, section) => sum + section.count, 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                    {SECTION_IDS.reduce((sum, id) => sum + (counts[id] ?? 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-slate-900">Marking</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Correct</dt>
                <dd className="font-medium text-emerald-700">+1.00</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Wrong</dt>
                <dd className="font-medium text-rose-700">−0.25</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Skipped</dt>
                <dd className="font-medium text-slate-700">0.00</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <dt className="text-slate-600">Pass mark</dt>
                <dd className="font-medium text-slate-900">{EXAM_PATTERN.passMark}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Target</dt>
                <dd className="font-medium text-slate-900">{EXAM_PATTERN.targetMark}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-slate-900">How questions are picked</h2>
            <ol className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
              <li>1. Questions you have never seen.</li>
              <li>2. Questions you answered wrong most often.</li>
              <li>3. A random draw to fill the remaining quota.</li>
            </ol>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              The bank currently holds {SECTION_IDS.reduce((sum, id) => sum + (counts[id] ?? 0), 0)}{" "}
              published questions.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

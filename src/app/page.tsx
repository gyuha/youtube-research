import { ChannelList } from '@/components/channel-list';
import { ChannelRegistrationForm } from '@/components/channel-registration-form';
import { ResultDetailPanel } from '@/components/result-detail-panel';
import { channelRepository } from '@/server/db/repositories/channel-repository';

export default async function HomePage() {
  const channels = await channelRepository.listForDashboard();

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="hero-panel">
          <p className="eyebrow">Internal dashboard</p>
          <h1>YouTube Research Dashboard</h1>
          <p className="hero-copy">
            Register channels, collect the latest video on demand, and keep the
            newest Korean summary in view.
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-950">
              Register Channel
            </h2>
            <p className="text-sm text-slate-600">
              Paste a YouTube channel URL to add it to the dashboard.
            </p>
          </div>
          <div className="mt-5">
            <ChannelRegistrationForm />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-4 rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-950">
                Registered Channels
              </h2>
              <p className="text-sm text-slate-600">
                Trigger collection manually and keep an eye on the latest state.
              </p>
            </div>
            <ChannelList channels={channels} />
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-950">
                Latest Result
              </h2>
              <p className="text-sm text-slate-600">
                Review the newest stored video snapshot and Korean analysis.
              </p>
            </div>
            <ResultDetailPanel channel={channels[0] ?? null} />
          </div>
        </section>
      </div>
    </main>
  );
}

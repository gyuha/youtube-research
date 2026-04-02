import { COLLECTION_STATUSES } from '@/server/collection/collection-status';

import type { DashboardChannel } from './dashboard-types';

import { StatusBadge } from './status-badge';

function formatPublishedAt(value: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function getInsights(channel: DashboardChannel) {
  return [
    channel.analysisResult?.insight1,
    channel.analysisResult?.insight2,
    channel.analysisResult?.insight3,
  ].filter((insight): insight is string => Boolean(insight));
}

function getSummaryText(channel: DashboardChannel) {
  return (
    channel.analysisResult?.errorMessage ??
    channel.analysisResult?.summary ??
    'The latest status will appear here after collection finishes.'
  );
}

export function ResultDetailPanel({
  channel,
}: {
  channel: DashboardChannel | null;
}) {
  if (!channel) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-600">
        Select a channel by registering one first. The latest result will appear here.
      </div>
    );
  }

  const status = channel.analysisResult?.status ?? COLLECTION_STATUSES.idle;
  const insights = getInsights(channel);

  return (
    <article className="space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold text-slate-950">{channel.title}</h3>
          <StatusBadge status={status} />
        </div>
        {channel.videoSnapshot ? (
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-slate-900">
              {channel.videoSnapshot.title}
            </h4>
            <p className="text-sm text-slate-600">
              Published {formatPublishedAt(channel.videoSnapshot.publishedAt)}
            </p>
            <a
              className="text-sm font-medium text-sky-700 underline-offset-2 hover:underline"
              href={channel.videoSnapshot.videoUrl}
            >
              Open video
            </a>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            No collected video yet. Run a collection to populate the latest result.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Summary
        </h4>
        <p className="text-sm leading-7 text-slate-700">{getSummaryText(channel)}</p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Insights
        </h4>
        {insights.length > 0 ? (
          <ul className="space-y-2 text-sm text-slate-700">
            {insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">
            No insights yet. The latest terminal status is {status}.
          </p>
        )}
      </div>
    </article>
  );
}

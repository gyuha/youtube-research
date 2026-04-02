import { collectChannel } from '@/app/actions/collect-channel';
import { COLLECTION_STATUSES } from '@/server/collection/collection-status';

import type { DashboardChannel } from './dashboard-types';

import { StatusBadge } from './status-badge';

function formatLastChecked(value: Date | null) {
  if (!value) {
    return 'Never checked';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export function ChannelCard({ channel }: { channel: DashboardChannel }) {
  const status = channel.analysisResult?.status ?? COLLECTION_STATUSES.idle;

  async function collectChannelAction() {
    'use server';

    await collectChannel({
      channelId: channel.id,
      youtubeChannelId: channel.youtubeChannelId,
    });
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {channel.thumbnailUrl ? (
          <img
            alt=""
            className="h-14 w-14 rounded-2xl object-cover"
            height={56}
            src={channel.thumbnailUrl}
            width={56}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-lg font-semibold text-slate-600">
            {channel.title.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-950">{channel.title}</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-slate-600">
              Last checked: {formatLastChecked(channel.lastCheckedAt)}
            </p>
          </div>
          <form action={collectChannelAction}>
            <button
              aria-label={`Collect Now for ${channel.title}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-500 hover:bg-slate-50"
              type="submit"
            >
              Collect Now
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

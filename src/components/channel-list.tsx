import type { DashboardChannel } from './dashboard-types';

import { ChannelCard } from './channel-card';

export function ChannelList({
  channels,
}: {
  channels: DashboardChannel[];
}) {
  if (channels.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-600">
        No channels yet. Register a YouTube channel to start collecting.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <ChannelCard channel={channel} key={channel.id} />
      ))}
    </div>
  );
}

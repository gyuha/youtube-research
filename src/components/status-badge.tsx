import {
  COLLECTION_STATUSES,
  type CollectionStatus,
} from '@/server/collection/collection-status';

const badgeClassNames: Record<string, string> = {
  [COLLECTION_STATUSES.collecting]:
    'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200',
  [COLLECTION_STATUSES.completed]:
    'bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-200',
  [COLLECTION_STATUSES.failed]:
    'bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-200',
  [COLLECTION_STATUSES.idle]:
    'bg-slate-200 text-slate-900 ring-1 ring-inset ring-slate-300',
  [COLLECTION_STATUSES.noCaptions]:
    'bg-orange-100 text-orange-900 ring-1 ring-inset ring-orange-200',
  [COLLECTION_STATUSES.noChange]:
    'bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-200',
};

export function StatusBadge({ status }: { status?: CollectionStatus | null }) {
  const resolvedStatus = status ?? COLLECTION_STATUSES.idle;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClassNames[resolvedStatus] ?? badgeClassNames[COLLECTION_STATUSES.idle]}`}
    >
      {resolvedStatus}
    </span>
  );
}

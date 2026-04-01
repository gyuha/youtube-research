export const COLLECTION_STATUSES = {
  collecting: 'Collecting',
  completed: 'Completed',
  failed: 'Failed',
  idle: 'Idle',
  noCaptions: 'No Captions',
  noChange: 'No Change',
} as const;

export type CollectionStatus =
  (typeof COLLECTION_STATUSES)[keyof typeof COLLECTION_STATUSES];

const TERMINAL_COLLECTION_STATUSES = new Set<CollectionStatus>([
  COLLECTION_STATUSES.completed,
  COLLECTION_STATUSES.failed,
  COLLECTION_STATUSES.noCaptions,
  COLLECTION_STATUSES.noChange,
]);

export function isTerminalCollectionStatus(status: CollectionStatus) {
  return TERMINAL_COLLECTION_STATUSES.has(status);
}

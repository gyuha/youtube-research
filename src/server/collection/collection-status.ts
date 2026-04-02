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

export function isTerminalCollectionStatus(status: CollectionStatus) {
  return status !== COLLECTION_STATUSES.collecting;
}

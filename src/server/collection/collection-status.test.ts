import { describe, expect, it } from 'vitest';

import {
  COLLECTION_STATUSES,
  isTerminalCollectionStatus,
} from './collection-status';

describe('collection status helpers', () => {
  it('treats completed as terminal', () => {
    expect(isTerminalCollectionStatus(COLLECTION_STATUSES.completed)).toBe(
      true,
    );
  });

  it('treats collecting as non-terminal', () => {
    expect(isTerminalCollectionStatus(COLLECTION_STATUSES.collecting)).toBe(
      false,
    );
  });
});

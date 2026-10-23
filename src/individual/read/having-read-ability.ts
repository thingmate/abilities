import type { ReadAction } from './read-action.ts';

export interface HavingReadAbility<GValue> {
  readonly read: ReadAction<GValue>;
}

import type { WriteAction } from './write-action.ts';

export interface HavingWriteAbility<GValue> {
  readonly write: WriteAction<GValue>;
}

import type { ReadAction } from './read-action.ts';

/**
 * An object having the ability to read: it exposes a {@link ReadAction}.
 *
 * @template GValue - The type of the read value.
 */
export interface HavingReadAbility<GValue> {
  /** Reads and returns the current value. */
  readonly read: ReadAction<GValue>;
}

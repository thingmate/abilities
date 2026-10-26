import type { WriteAction } from './write-action.ts';

/**
 * An object having the ability to write: it exposes a {@link WriteAction}.
 *
 * @template GValue - The type of the writable value.
 */
export interface HavingWriteAbility<GValue> {
  /** Writes the provided value. */
  readonly write: WriteAction<GValue>;
}

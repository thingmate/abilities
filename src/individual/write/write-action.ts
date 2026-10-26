import type { AsyncFunction } from '@xstd/async-function';

/**
 * An asynchronous, abortable action that writes a value, without expecting any result.
 *
 * Calling it resolves with `void` once the value was written.
 *
 * @template GValue - The type of the written value.
 */
export type WriteAction<GValue> = AsyncFunction<[GValue], void>;

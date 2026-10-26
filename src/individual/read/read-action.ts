import type { AsyncFunction } from '@xstd/async-function';

/**
 * An asynchronous, abortable action that reads and returns a value.
 *
 * Calling it resolves with the read value.
 *
 * @template GValue - The type of the read value.
 */
export type ReadAction<GValue> = AsyncFunction<[], GValue>;

import type { AsyncFunction } from '@xstd/async-function';

/**
 * An asynchronous, abortable action that sends (triggers) something with the provided arguments,
 * without expecting any result.
 *
 * Calling it resolves with `void` once the action is completed.
 *
 * @template GArguments - The tuple type of the arguments passed to the action.
 */
export type SendAction<GArguments extends readonly unknown[]> = AsyncFunction<GArguments, void>;

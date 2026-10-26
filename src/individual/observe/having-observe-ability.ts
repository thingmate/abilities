import type { ObservableAsyncFunction } from '@xstd/observable-async-function';

/**
 * An object having the ability to observe values over time: it exposes an
 * {@link ObservableAsyncFunction}.
 *
 * @template GValue - The type of the observed values.
 * @template GArguments - The tuple type of the extra arguments passed at observation time.
 */
export interface HavingObserveAbility<GValue, GArguments extends readonly unknown[] = []> {
  /** Observes values over time: calling it establishes a live resource emitting the values. */
  readonly observe: ObservableAsyncFunction<GValue, GArguments>;
}

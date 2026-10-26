import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { HavingObserveAbility } from './having-observe-ability.ts';

/**
 * The ability to observe values over time, wrapping an {@link ObservableAsyncFunction}.
 *
 * @template GValue - The type of the observed values.
 * @template GArguments - The tuple type of the extra arguments passed at observation time.
 *
 * @example
 * ```ts
 * const temperature: ObserveAbility<number> = new ObserveAbility(temperatureChanges);
 *
 * for await (const value of temperature.observe.values(signal)) {
 *   console.log(value); // every emitted temperature
 * }
 * ```
 */
export class ObserveAbility<
  GValue,
  GArguments extends readonly unknown[] = [],
> implements HavingObserveAbility<GValue, GArguments> {
  readonly #observe: ObservableAsyncFunction<GValue, GArguments>;

  /**
   * Creates a new {@link ObserveAbility}.
   *
   * @param observe - The observable async function emitting the observed values.
   */
  constructor(observe: ObservableAsyncFunction<GValue, GArguments>) {
    this.#observe = observe;
  }

  /** The wrapped observable async function emitting the observed values over time. */
  get observe(): ObservableAsyncFunction<GValue, GArguments> {
    return this.#observe;
  }
}

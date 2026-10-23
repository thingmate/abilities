import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { HavingObserveAbility } from './having-observe-ability.ts';

export class ObserveAbility<
  GValue,
  GArguments extends readonly unknown[] = [],
> implements HavingObserveAbility<GValue, GArguments> {
  readonly #observe: ObservableAsyncFunction<GValue, GArguments>;

  constructor(observe: ObservableAsyncFunction<GValue, GArguments>) {
    this.#observe = observe;
  }

  get observe(): ObservableAsyncFunction<GValue, GArguments> {
    return this.#observe;
  }
}

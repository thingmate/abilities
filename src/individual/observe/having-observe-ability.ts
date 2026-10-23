import type { ObservableAsyncFunction } from '@xstd/observable-async-function';

export interface HavingObserveAbility<GValue, GArguments extends readonly unknown[] = []> {
  readonly observe: ObservableAsyncFunction<GValue, GArguments>;
}

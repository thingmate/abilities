import { type MapFunction } from '@xstd/map-function';
import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { ReadAction } from '../../../individual/read/read-action.ts';
import type { HavingReadonlyPropertyAbilities } from './having-readonly-property-abilities.ts';

export class ReadonlyPropertyAbilities<GValue> implements HavingReadonlyPropertyAbilities<GValue> {
  readonly #read: ReadAction<GValue>;
  readonly #observe: ObservableAsyncFunction<GValue>;

  constructor({ read, observe }: HavingReadonlyPropertyAbilities<GValue>) {
    this.#read = read;
    this.#observe = observe;
  }

  get read(): ReadAction<GValue> {
    return this.#read;
  }

  get observe(): ObservableAsyncFunction<GValue> {
    return this.#observe;
  }

  map<GNewValue>(map: MapFunction<GValue, GNewValue>): ReadonlyPropertyAbilities<GNewValue> {
    return new ReadonlyPropertyAbilities<GNewValue>({
      read: this.#read.then(map),
      observe: this.#observe.map(map),
    });
  }
}

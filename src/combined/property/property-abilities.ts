import { type MapInOut, mapOneArgument } from '@xstd/map-function';
import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { ReadAction } from '../../individual/read/read-action.ts';
import type { WriteAction } from '../../individual/write/write-action.ts';
import type { HavingPropertyAbilities } from './having-property-abilities.ts';
import { ReadonlyPropertyAbilities } from './readonly/readonly-property-abilities.ts';

export class PropertyAbilities<GValue> implements HavingPropertyAbilities<GValue> {
  readonly #read: ReadAction<GValue>;
  readonly #write: WriteAction<GValue>;
  readonly #observe: ObservableAsyncFunction<GValue>;

  constructor({ read, write, observe }: HavingPropertyAbilities<GValue>) {
    this.#read = read;
    this.#write = write;
    this.#observe = observe;
  }

  get read(): ReadAction<GValue> {
    return this.#read;
  }

  get write(): WriteAction<GValue> {
    return this.#write;
  }

  get observe(): ObservableAsyncFunction<GValue> {
    return this.#observe;
  }

  map<GNewValue>({ inOut, outIn }: MapInOut<GValue, GNewValue>): PropertyAbilities<GNewValue> {
    return new PropertyAbilities<GNewValue>({
      read: this.#read.then(inOut),
      write: this.#write.mapArguments(mapOneArgument(outIn)),
      observe: this.#observe.map(inOut),
    });
  }

  asReadonly(): ReadonlyPropertyAbilities<GValue> {
    return new ReadonlyPropertyAbilities<GValue>({
      read: this.#read,
      observe: this.#observe,
    });
  }
}

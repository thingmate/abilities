import { type MapFunction } from '@xstd/map-function';
import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { ReadAction } from '../../../individual/read/read-action.ts';
import type { HavingReadonlyPropertyAbilities } from './having-readonly-property-abilities.ts';

/**
 * The abilities of a readonly property: reading its current value ({@link ReadAction}) and
 * observing its changes over time ({@link ObservableAsyncFunction}).
 *
 * @template GValue - The type of the property's value.
 */
export class ReadonlyPropertyAbilities<GValue> implements HavingReadonlyPropertyAbilities<GValue> {
  readonly #read: ReadAction<GValue>;
  readonly #observe: ObservableAsyncFunction<GValue>;

  /**
   * Creates a new {@link ReadonlyPropertyAbilities}.
   *
   * @param abilities - The abilities to wrap.
   * @param abilities.read - The action reading the property's current value.
   * @param abilities.observe - The observable async function emitting the property's changes.
   */
  constructor({ read, observe }: HavingReadonlyPropertyAbilities<GValue>) {
    this.#read = read;
    this.#observe = observe;
  }

  /** The action reading the property's current value. */
  get read(): ReadAction<GValue> {
    return this.#read;
  }

  /** The observable async function emitting the property's changes. */
  get observe(): ObservableAsyncFunction<GValue> {
    return this.#observe;
  }

  /**
   * Maps these readonly property abilities to work with a different value type.
   *
   * Values read from, or observed through, the returned property abilities are mapped with the
   * provided function.
   *
   * @template GNewValue - The type of the value of the returned property abilities.
   * @param map - A function mapping this property's value into the new one.
   * @returns New readonly property abilities working with `GNewValue`.
   */
  map<GNewValue>(map: MapFunction<GValue, GNewValue>): ReadonlyPropertyAbilities<GNewValue> {
    return new ReadonlyPropertyAbilities<GNewValue>({
      read: this.#read.then(map),
      observe: this.#observe.map(map),
    });
  }
}

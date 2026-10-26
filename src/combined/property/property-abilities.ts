import { type MapInOut, mapOneArgument } from '@xstd/map-function';
import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { ReadAction } from '../../individual/read/read-action.ts';
import type { WriteAction } from '../../individual/write/write-action.ts';
import type { HavingPropertyAbilities } from './having-property-abilities.ts';
import { ReadonlyPropertyAbilities } from './readonly/readonly-property-abilities.ts';

/**
 * The abilities of a property: reading its current value ({@link ReadAction}), writing it
 * ({@link WriteAction}), and observing its changes over time ({@link ObservableAsyncFunction}).
 *
 * @template GValue - The type of the property's value.
 *
 * @example
 * ```ts
 * const temperature: PropertyAbilities<number> = new PropertyAbilities({
 *   read: new AsyncFunction(async () => sensor.temperature),
 *   write: new AsyncFunction(async (signal, value: number): Promise<void> => {
 *     await sensor.setTemperature(value, { signal });
 *   }),
 *   observe: temperatureChanges, // an `ObservableAsyncFunction<number>`
 * });
 *
 * const current: number = await temperature.read.call(signal);
 * await temperature.write.call(signal, 21.5);
 * ```
 */
export class PropertyAbilities<GValue> implements HavingPropertyAbilities<GValue> {
  readonly #read: ReadAction<GValue>;
  readonly #write: WriteAction<GValue>;
  readonly #observe: ObservableAsyncFunction<GValue>;

  /**
   * Creates a new {@link PropertyAbilities}.
   *
   * @param abilities - The abilities to wrap.
   * @param abilities.read - The action reading the property's current value.
   * @param abilities.write - The action writing the property's value.
   * @param abilities.observe - The observable async function emitting the property's changes.
   */
  constructor({ read, write, observe }: HavingPropertyAbilities<GValue>) {
    this.#read = read;
    this.#write = write;
    this.#observe = observe;
  }

  /** The action reading the property's current value. */
  get read(): ReadAction<GValue> {
    return this.#read;
  }

  /** The action writing the property's value. */
  get write(): WriteAction<GValue> {
    return this.#write;
  }

  /** The observable async function emitting the property's changes. */
  get observe(): ObservableAsyncFunction<GValue> {
    return this.#observe;
  }

  /**
   * Maps these property abilities to work with a different value type.
   *
   * Values read from, or observed through, the returned property abilities are mapped with `inOut`,
   * while values written to them are mapped back to this property's value type with `outIn`.
   *
   * @template GNewValue - The type of the value of the returned property abilities.
   * @param mapping - The bi-directional mapping between this property's value and the new one.
   * @param mapping.inOut - Maps this property's value into the new one.
   * @param mapping.outIn - Maps the new value into this property's value.
   * @returns New property abilities working with `GNewValue`.
   */
  map<GNewValue>({ inOut, outIn }: MapInOut<GValue, GNewValue>): PropertyAbilities<GNewValue> {
    return new PropertyAbilities<GNewValue>({
      read: this.#read.then(inOut),
      write: this.#write.mapArguments(mapOneArgument(outIn)),
      observe: this.#observe.map(inOut),
    });
  }

  /**
   * Returns a readonly view of these property abilities.
   *
   * The returned instance exposes the same read and observe abilities, without the write ability.
   *
   * @returns New readonly property abilities reading from, and observing, this property.
   */
  asReadonly(): ReadonlyPropertyAbilities<GValue> {
    return new ReadonlyPropertyAbilities<GValue>({
      read: this.#read,
      observe: this.#observe,
    });
  }
}

import type { MapInOut } from '@xstd/map-function';
import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { SendAction } from '../../individual/send/send-action.ts';
import type { HavingCommandAbilities } from './having-command-abilities.ts';

/**
 * The abilities of a command: sending it ({@link SendAction}) and observing it
 * ({@link ObservableAsyncFunction}).
 *
 * The observed values are typed with the command's own arguments tuple: a command accepting
 * `[volume: number]` observes values of type `[volume: number]`.
 *
 * @template GArguments - The tuple type of the arguments accepted by the command.
 *
 * @example
 * ```ts
 * const setVolume: CommandAbilities<[volume: number]> = new CommandAbilities({
 *   send: new AsyncFunction(async (signal, volume: number): Promise<void> => {
 *     await device.setVolume(volume, { signal });
 *   }),
 *   observe: volumeChanges, // an `ObservableAsyncFunction<[volume: number]>`
 * });
 *
 * await setVolume.send.call(signal, 50);
 * ```
 */
export class CommandAbilities<
  GArguments extends readonly unknown[],
> implements HavingCommandAbilities<GArguments> {
  readonly #send: SendAction<GArguments>;
  readonly #observe: ObservableAsyncFunction<GArguments>;

  /**
   * Creates a new {@link CommandAbilities}.
   *
   * @param abilities - The abilities to wrap.
   * @param abilities.send - The action invoked when the command is sent.
   * @param abilities.observe - The observable async function emitting the command's events.
   */
  constructor({ send, observe }: HavingCommandAbilities<GArguments>) {
    this.#send = send;
    this.#observe = observe;
  }

  /** The action invoked when the command is sent. */
  get send(): SendAction<GArguments> {
    return this.#send;
  }

  /** The observable async function emitting the command's events. */
  get observe(): ObservableAsyncFunction<GArguments> {
    return this.#observe;
  }

  /**
   * Maps these command abilities to work with different arguments.
   *
   * The send action of the returned command abilities accepts `GNewArguments` and maps them back to
   * this command's arguments with `outIn`, while the values emitted by its observation are mapped
   * to the new type with `inOut`.
   *
   * @template GNewArguments - The tuple type of the arguments of the returned command abilities.
   * @param mapping - The bi-directional mapping between this command's arguments and the new ones.
   * @param mapping.inOut - Maps this command's arguments into the new ones.
   * @param mapping.outIn - Maps the new arguments into this command's arguments.
   * @returns New command abilities working with `GNewArguments`.
   */
  map<GNewArguments extends readonly unknown[]>({
    inOut,
    outIn,
  }: MapInOut<GArguments, GNewArguments>): CommandAbilities<GNewArguments> {
    return new CommandAbilities<GNewArguments>({
      send: this.#send.mapArguments((...args: GNewArguments): GArguments => {
        return outIn(args);
      }),
      observe: this.#observe.map(inOut),
    });
  }
}

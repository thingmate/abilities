import type { MapInOut } from '@xstd/map-function';
import type { ObservableAsyncFunction } from '@xstd/observable-async-function';
import type { SendAction } from '../../individual/send/send-action.ts';
import type { HavingCommandAbilities } from './having-command-abilities.ts';

export class CommandAbilities<
  GArguments extends readonly unknown[],
> implements HavingCommandAbilities<GArguments> {
  readonly #send: SendAction<GArguments>;
  readonly #observe: ObservableAsyncFunction<GArguments>;

  constructor({ send, observe }: HavingCommandAbilities<GArguments>) {
    this.#send = send;
    this.#observe = observe;
  }

  get send(): SendAction<GArguments> {
    return this.#send;
  }

  get observe(): ObservableAsyncFunction<GArguments> {
    return this.#observe;
  }

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

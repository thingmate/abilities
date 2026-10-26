import type { SendAction } from './send-action.ts';

/**
 * An object having the ability to send: it exposes a {@link SendAction}.
 *
 * @template GArguments - The tuple type of the arguments accepted by the send action.
 */
export interface HavingSendAbility<GArguments extends readonly unknown[]> {
  /** Sends (triggers) something with the provided arguments, without expecting any result. */
  readonly send: SendAction<GArguments>;
}

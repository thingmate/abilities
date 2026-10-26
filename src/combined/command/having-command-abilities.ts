import type { HavingObserveAbility } from '../../individual/observe/having-observe-ability.ts';
import type { HavingSendAbility } from '../../individual/send/having-send-ability.ts';

/**
 * An object having the abilities of a command: sending it ({@link HavingSendAbility}) and observing
 * it ({@link HavingObserveAbility}).
 *
 * @template GArguments - The tuple type of the arguments accepted by the command.
 */
export interface HavingCommandAbilities<GArguments extends readonly unknown[]>
  extends HavingSendAbility<GArguments>, HavingObserveAbility<GArguments> {}

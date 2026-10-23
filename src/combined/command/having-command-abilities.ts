import type { HavingObserveAbility } from '../../individual/observe/having-observe-ability.ts';
import type { HavingSendAbility } from '../../individual/send/having-send-ability.ts';

export interface HavingCommandAbilities<GArguments extends readonly unknown[]>
  extends HavingSendAbility<GArguments>, HavingObserveAbility<GArguments> {}

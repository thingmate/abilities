import type { HavingObserveAbility } from '../../../individual/observe/having-observe-ability.ts';
import type { HavingReadAbility } from '../../../individual/read/having-read-ability.ts';

export interface HavingReadonlyPropertyAbilities<GValue>
  extends HavingReadAbility<GValue>, HavingObserveAbility<GValue> {}

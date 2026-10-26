import type { HavingObserveAbility } from '../../../individual/observe/having-observe-ability.ts';
import type { HavingReadAbility } from '../../../individual/read/having-read-ability.ts';

/**
 * An object having the abilities of a readonly property: reading it ({@link HavingReadAbility}) and
 * observing it ({@link HavingObserveAbility}).
 *
 * @template GValue - The type of the property's value.
 */
export interface HavingReadonlyPropertyAbilities<GValue>
  extends HavingReadAbility<GValue>, HavingObserveAbility<GValue> {}

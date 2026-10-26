import type { HavingWriteAbility } from '../../individual/write/having-write-ability.ts';
import type { HavingReadonlyPropertyAbilities } from './readonly/having-readonly-property-abilities.ts';

/**
 * An object having the abilities of a property: reading and observing it
 * ({@link HavingReadonlyPropertyAbilities}) and writing it ({@link HavingWriteAbility}).
 *
 * @template GValue - The type of the property's value.
 */
export interface HavingPropertyAbilities<GValue>
  extends HavingReadonlyPropertyAbilities<GValue>, HavingWriteAbility<GValue> {}

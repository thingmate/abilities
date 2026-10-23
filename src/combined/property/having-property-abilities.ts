import type { HavingWriteAbility } from '../../individual/write/having-write-ability.ts';
import type { HavingReadonlyPropertyAbilities } from './readonly/having-readonly-property-abilities.ts';

export interface HavingPropertyAbilities<GValue>
  extends HavingReadonlyPropertyAbilities<GValue>, HavingWriteAbility<GValue> {}

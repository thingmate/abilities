import type { SendAction } from './send-action.ts';

export interface HavingSendAbility<GArguments extends readonly unknown[]> {
  readonly send: SendAction<GArguments>;
}

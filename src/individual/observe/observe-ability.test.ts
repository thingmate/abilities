import { type EmitValue, ListenerResource } from '@xstd/listener-resource';
import { ObservableAsyncFunction } from '@xstd/observable-async-function';
import { describe, expect, it } from 'vitest';
import { ObserveAbility } from './observe-ability.ts';

interface TestSource<GValue> {
  readonly observable: ObservableAsyncFunction<GValue>;
  readonly emit: (value: GValue) => void;
}

function createTestSource<GValue>(): TestSource<GValue> {
  let emitValue: EmitValue<GValue> | undefined;

  const observable: ObservableAsyncFunction<GValue> = new ObservableAsyncFunction(
    async (): Promise<ListenerResource<GValue>> => {
      return new ListenerResource<GValue>((emit: EmitValue<GValue>): void => {
        emitValue = emit;
      });
    },
  );

  return {
    observable,
    emit: (value: GValue): void => {
      if (emitValue === undefined) {
        throw new Error('The source is not established.');
      }
      emitValue(value);
    },
  };
}

describe('ObserveAbility', () => {
  it('exposes the provided observable async function', () => {
    const source: TestSource<number> = createTestSource<number>();
    const ability: ObserveAbility<number> = new ObserveAbility<number>(source.observable);

    expect(ability.observe).toBe(source.observable);
  });

  it('forwards the emitted values to the observation consumers', async () => {
    const source: TestSource<number> = createTestSource<number>();
    const ability: ObserveAbility<number> = new ObserveAbility<number>(source.observable);

    const controller: AbortController = new AbortController();
    const resource: ListenerResource<number> = await ability.observe.call(controller.signal);

    const values: number[] = [];
    resource.listen((value: number): void => {
      values.push(value);
    });

    source.emit(21.5);
    source.emit(22);

    await resource.close();

    expect(values).toEqual([21.5, 22]);
  });
});

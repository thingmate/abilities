import { AsyncFunction } from '@xstd/async-function';
import { type EmitValue, ListenerResource } from '@xstd/listener-resource';
import { ObservableAsyncFunction } from '@xstd/observable-async-function';
import { describe, expect, it } from 'vitest';
import { type ReadAction } from '../../../individual/read/read-action.ts';
import { ReadonlyPropertyAbilities } from './readonly-property-abilities.ts';

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

describe('ReadonlyPropertyAbilities', () => {
  it('exposes the provided read and observe abilities', () => {
    const source: TestSource<number> = createTestSource<number>();
    const read: ReadAction<number> = new AsyncFunction(async (): Promise<number> => 21.5);

    const ability: ReadonlyPropertyAbilities<number> = new ReadonlyPropertyAbilities<number>({
      read,
      observe: source.observable,
    });

    expect(ability.read).toBe(read);
    expect(ability.observe).toBe(source.observable);
  });

  it('reads the current value', async () => {
    const ability: ReadonlyPropertyAbilities<number> = new ReadonlyPropertyAbilities<number>({
      read: new AsyncFunction(async (): Promise<number> => 21.5),
      observe: createTestSource<number>().observable,
    });

    const value: number = await ability.read.call(new AbortController().signal);

    expect(value).toBe(21.5);
  });

  it('forwards the emitted values to the observation consumers', async () => {
    const source: TestSource<number> = createTestSource<number>();
    const ability: ReadonlyPropertyAbilities<number> = new ReadonlyPropertyAbilities<number>({
      read: new AsyncFunction(async (): Promise<number> => 0),
      observe: source.observable,
    });

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

  it('maps the read and observed values', async () => {
    const source: TestSource<number> = createTestSource<number>();

    const celsius: ReadonlyPropertyAbilities<number> = new ReadonlyPropertyAbilities<number>({
      read: new AsyncFunction(async (): Promise<number> => 10),
      observe: source.observable,
    });

    const fahrenheit: ReadonlyPropertyAbilities<number> = celsius.map(
      (celsius: number): number => celsius * 1.8 + 32,
    );

    expect(fahrenheit).not.toBe(celsius);
    expect(await fahrenheit.read.call(new AbortController().signal)).toBe(50);

    const controller: AbortController = new AbortController();
    const resource: ListenerResource<number> = await fahrenheit.observe.call(controller.signal);

    const values: number[] = [];
    resource.listen((value: number): void => {
      values.push(value);
    });

    source.emit(20);

    await resource.close();

    expect(values).toEqual([68]);
  });
});

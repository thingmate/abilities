import { AsyncFunction } from '@xstd/async-function';
import { type EmitValue, ListenerResource } from '@xstd/listener-resource';
import { ObservableAsyncFunction } from '@xstd/observable-async-function';
import { describe, expect, it } from 'vitest';
import { type ReadAction } from '../../individual/read/read-action.ts';
import { type WriteAction } from '../../individual/write/write-action.ts';
import { PropertyAbilities } from './property-abilities.ts';
import { ReadonlyPropertyAbilities } from './readonly/readonly-property-abilities.ts';

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

describe('PropertyAbilities', () => {
  it('exposes the provided read, write and observe abilities', () => {
    const source: TestSource<number> = createTestSource<number>();
    const read: ReadAction<number> = new AsyncFunction(async (): Promise<number> => 21.5);
    const write: WriteAction<number> = new AsyncFunction(
      async (signal: AbortSignal, _value: number): Promise<void> => {
        signal.throwIfAborted();
      },
    );

    const ability: PropertyAbilities<number> = new PropertyAbilities<number>({
      read,
      write,
      observe: source.observable,
    });

    expect(ability.read).toBe(read);
    expect(ability.write).toBe(write);
    expect(ability.observe).toBe(source.observable);
  });

  it('writes the provided value', async () => {
    const writtenValues: number[] = [];

    const ability: PropertyAbilities<number> = new PropertyAbilities<number>({
      read: new AsyncFunction(async (): Promise<number> => 0),
      write: new AsyncFunction(async (signal: AbortSignal, value: number): Promise<void> => {
        signal.throwIfAborted();
        writtenValues.push(value);
      }),
      observe: createTestSource<number>().observable,
    });

    await ability.write.call(new AbortController().signal, 21.5);

    expect(writtenValues).toEqual([21.5]);
  });

  it('maps the read, written and observed values', async () => {
    const source: TestSource<number> = createTestSource<number>();

    const writtenCelsiusValues: number[] = [];

    const celsius: PropertyAbilities<number> = new PropertyAbilities<number>({
      read: new AsyncFunction(async (): Promise<number> => 10),
      write: new AsyncFunction(async (signal: AbortSignal, value: number): Promise<void> => {
        signal.throwIfAborted();
        writtenCelsiusValues.push(value);
      }),
      observe: source.observable,
    });

    const fahrenheit: PropertyAbilities<number> = celsius.map({
      inOut: (celsius: number): number => celsius * 1.8 + 32,
      outIn: (fahrenheit: number): number => (fahrenheit - 32) / 1.8,
    });

    expect(fahrenheit).not.toBe(celsius);
    expect(await fahrenheit.read.call(new AbortController().signal)).toBe(50);

    await fahrenheit.write.call(new AbortController().signal, 68);
    expect(writtenCelsiusValues).toEqual([20]);

    const controller: AbortController = new AbortController();
    const resource: ListenerResource<number> = await fahrenheit.observe.call(controller.signal);

    const values: number[] = [];
    resource.listen((value: number): void => {
      values.push(value);
    });

    source.emit(30);

    await resource.close();

    expect(values).toEqual([86]);
  });

  it('returns a readonly view sharing the read and observe abilities', () => {
    const source: TestSource<number> = createTestSource<number>();
    const read: ReadAction<number> = new AsyncFunction(async (): Promise<number> => 21.5);

    const ability: PropertyAbilities<number> = new PropertyAbilities<number>({
      read,
      write: new AsyncFunction(async (signal: AbortSignal, _value: number): Promise<void> => {
        signal.throwIfAborted();
      }),
      observe: source.observable,
    });

    const readonlyView: ReadonlyPropertyAbilities<number> = ability.asReadonly();

    expect(readonlyView).toBeInstanceOf(ReadonlyPropertyAbilities);
    expect(readonlyView.read).toBe(read);
    expect(readonlyView.observe).toBe(source.observable);
    expect('write' in readonlyView).toBe(false);
  });
});

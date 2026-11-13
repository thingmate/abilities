import { AsyncFunction } from '@xstd/async-function';
import { type EmitValue, ListenerResource } from '@xstd/listener-resource';
import { ObservableAsyncFunction } from '@xstd/observable-async-function';
import { describe, expect, it } from 'vitest';
import { type SendAction } from '../../individual/send/send-action.ts';
import { CommandAbilities } from './command-abilities.ts';

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

describe('CommandAbilities', () => {
  it('exposes the provided send and observe abilities', () => {
    const source: TestSource<[celsius: number]> = createTestSource<[celsius: number]>();
    const send: SendAction<[celsius: number]> = new AsyncFunction(
      async (signal: AbortSignal, _celsius: number): Promise<void> => {
        signal.throwIfAborted();
      },
    );

    const ability: CommandAbilities<[celsius: number]> = new CommandAbilities<[celsius: number]>({
      send,
      observe: source.observable,
    });

    expect(ability.send).toBe(send);
    expect(ability.observe).toBe(source.observable);
  });

  it('sends the command with the provided arguments', async () => {
    const sentCelsiusValues: number[] = [];

    const ability: CommandAbilities<[celsius: number]> = new CommandAbilities<[celsius: number]>({
      send: new AsyncFunction(async (signal: AbortSignal, celsius: number): Promise<void> => {
        signal.throwIfAborted();
        sentCelsiusValues.push(celsius);
      }),
      observe: createTestSource<[celsius: number]>().observable,
    });

    await ability.send.call(new AbortController().signal, 20);

    expect(sentCelsiusValues).toEqual([20]);
  });

  it('maps the sent arguments and the observed values', async () => {
    const source: TestSource<[celsius: number]> = createTestSource<[celsius: number]>();

    const sentCelsiusValues: number[] = [];

    const setCelsius: CommandAbilities<[celsius: number]> = new CommandAbilities<[celsius: number]>(
      {
        send: new AsyncFunction(async (signal: AbortSignal, celsius: number): Promise<void> => {
          signal.throwIfAborted();
          sentCelsiusValues.push(celsius);
        }),
        observe: source.observable,
      },
    );

    const setFahrenheit: CommandAbilities<[fahrenheit: number]> = setCelsius.map({
      inOut: ([celsius]): [fahrenheit: number] => [celsius * 1.8 + 32],
      outIn: ([fahrenheit]): [celsius: number] => [(fahrenheit - 32) / 1.8],
    });

    expect(setFahrenheit).not.toBe(setCelsius);

    await setFahrenheit.send.call(new AbortController().signal, 68);
    expect(sentCelsiusValues).toEqual([20]);

    const controller: AbortController = new AbortController();
    const resource: ListenerResource<[fahrenheit: number]> = await setFahrenheit.observe.call(
      controller.signal,
    );

    const values: Array<[fahrenheit: number]> = [];
    resource.listen((value: [fahrenheit: number]): void => {
      values.push(value);
    });

    source.emit([20]);

    await resource.close();

    expect(values).toEqual([[68]]);
  });
});

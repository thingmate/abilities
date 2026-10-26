[![npm (scoped)](https://img.shields.io/npm/v/@thingmate/abilities.svg)](https://www.npmjs.com/package/@thingmate/abilities)
![npm](https://img.shields.io/npm/dm/@thingmate/abilities.svg)
![NPM](https://img.shields.io/npm/l/@thingmate/abilities.svg)
![npm type definitions](https://img.shields.io/npm/types/@thingmate/abilities.svg)
![AI generation](https://img.shields.io/badge/AI_generation-low-yellow)

<picture>
  <source height="64" media="(prefers-color-scheme: dark)" srcset="https://github.com/thingmate/website/blob/main/assets/logo/png/logo-large-dark.png?raw=true">
  <source height="64" media="(prefers-color-scheme: light)" srcset="https://github.com/thingmate/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
  <img height="64" alt="Shows a black logo in light color mode and a white one in dark color mode." src="https://github.com/thingmate/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
</picture>

## @thingmate/abilities

Generic abilities interfaces.

## 📦 Installation

```shell
yarn add @thingmate/abilities
# or
npm install @thingmate/abilities --save
```

## 📜 Documentation

This library defines generic **abilities**: minimal and composable interfaces describing what a
_thing_ can do.

They are built on top of
[`@xstd/async-function`](https://www.npmjs.com/package/@xstd/async-function) and
[`@xstd/observable-async-function`](https://www.npmjs.com/package/@xstd/observable-async-function):

- [`SendAction`](#sendaction) - send (trigger) something with arguments, without expecting a result
- [`ReadAction`](#readaction) - read and return a value
- [`WriteAction`](#writeaction) - write a value
- [`ObserveAbility`](#observeability) - observe values over time
- [`CommandAbilities`](#commandabilities) - send a command and observe it
- [`ReadonlyPropertyAbilities`](#readonlypropertyabilities) - read a value and observe its changes
- [`PropertyAbilities`](#propertyabilities) - read, write and observe a value

Each ability also exists as a `Having*` structural interface (see [Abilities](#abilities)): any
object exposing the matching properties fulfills it, no base class is required.

### Actions

Actions are abortable async functions: every call takes a leading `AbortSignal`, followed by the
action's arguments, and returns a promise.

| Action                   | Equivalent to                     | Description                                             |
| ------------------------ | --------------------------------- | ------------------------------------------------------- |
| `SendAction<GArguments>` | `AsyncFunction<GArguments, void>` | Sends (triggers) something with the provided arguments. |
| `ReadAction<GValue>`     | `AsyncFunction<[], GValue>`       | Reads and returns the current value.                    |
| `WriteAction<GValue>`    | `AsyncFunction<[GValue], void>`   | Writes the provided value.                              |

```ts
import { AsyncFunction } from '@xstd/async-function';
import type { ReadAction, WriteAction } from '@thingmate/abilities';

const readTemperature: ReadAction<number> = new AsyncFunction(async () => sensor.temperature);

const setTemperature: WriteAction<number> = new AsyncFunction(async (signal, value: number) => {
  await sensor.setTemperature(value, { signal });
});

const current: number = await readTemperature.call(signal);
await setTemperature.call(signal, 21.5);
```

### Abilities

The `Having*` interfaces declare the abilities exposed by an object.

| Interface                                  | Exposed property                                       |
| ------------------------------------------ | ------------------------------------------------------ |
| `HavingSendAbility<GArguments>`            | `send: SendAction<GArguments>`                         |
| `HavingReadAbility<GValue>`                | `read: ReadAction<GValue>`                             |
| `HavingWriteAbility<GValue>`               | `write: WriteAction<GValue>`                           |
| `HavingObserveAbility<GValue, GArguments>` | `observe: ObservableAsyncFunction<GValue, GArguments>` |

```ts
import type { HavingReadAbility, HavingWriteAbility } from '@thingmate/abilities';

interface Thermostat extends HavingReadAbility<number>, HavingWriteAbility<number> {}
```

### ObserveAbility

The ability to observe values over time, wrapping an `ObservableAsyncFunction`: calling `observe`
establishes a live resource emitting the observed values.

```ts
import { ObserveAbility } from '@thingmate/abilities';

const temperature: ObserveAbility<number> = new ObserveAbility(temperatureChanges);

for await (const value of temperature.observe.values(signal)) {
  console.log(value); // every emitted temperature
}
```

### CommandAbilities

The abilities of a command: sending it (`send`) and observing it (`observe`).

The observed values are typed with the command's own arguments tuple: a command accepting
`[celsius: number]` observes values of type `[celsius: number]`.

```ts
import { AsyncFunction } from '@xstd/async-function';
import { CommandAbilities } from '@thingmate/abilities';

const setCelsius: CommandAbilities<[celsius: number]> = new CommandAbilities({
  send: new AsyncFunction(async (signal, celsius: number) => {
    await thermostat.setTargetTemperature(celsius, { signal });
  }),
  observe: targetTemperatureChanges, // an `ObservableAsyncFunction<[celsius: number]>`
});

await setCelsius.send.call(signal, 21.5);

for await (const [celsius] of setCelsius.observe.values(signal)) {
  console.log(celsius);
}
```

`map` retypes the command: the returned `send` accepts the new arguments and maps them back to the
original ones with `outIn`, while the observed values are mapped with `inOut`. Both are mapped
tuple-wise.

```ts
const setFahrenheit: CommandAbilities<[fahrenheit: number]> = setCelsius.map({
  inOut: ([celsius]) => [celsius * 1.8 + 32],
  outIn: ([fahrenheit]) => [(fahrenheit - 32) / 1.8],
});

await setFahrenheit.send.call(signal, 70); // sends the command with ~21.1°C
```

Its structural counterpart is `HavingCommandAbilities<GArguments>`.

### ReadonlyPropertyAbilities

The abilities of a readonly property: reading its current value (`read`) and observing its changes
over time (`observe`).

```ts
import { AsyncFunction } from '@xstd/async-function';
import { ReadonlyPropertyAbilities } from '@thingmate/abilities';

const temperature: ReadonlyPropertyAbilities<number> = new ReadonlyPropertyAbilities({
  read: new AsyncFunction(async () => sensor.temperature),
  observe: temperatureChanges, // an `ObservableAsyncFunction<number>`
});

const current: number = await temperature.read.call(signal);

for await (const value of temperature.observe.values(signal)) {
  console.log(value); // every temperature change
}
```

`map` retypes the property with a single mapping function applied to the read and observed values.

```ts
const fahrenheit: ReadonlyPropertyAbilities<number> = temperature.map(
  (celsius: number): number => celsius * 1.8 + 32,
);
```

Its structural counterpart is `HavingReadonlyPropertyAbilities<GValue>`.

### PropertyAbilities

The abilities of a property: reading its current value (`read`), writing it (`write`), and
observing its changes over time (`observe`).

```ts
import { AsyncFunction } from '@xstd/async-function';
import { PropertyAbilities } from '@thingmate/abilities';

const temperature: PropertyAbilities<number> = new PropertyAbilities({
  read: new AsyncFunction(async () => sensor.temperature),
  write: new AsyncFunction(async (signal, value: number) => {
    await sensor.setTemperature(value, { signal });
  }),
  observe: temperatureChanges, // an `ObservableAsyncFunction<number>`
});

const current: number = await temperature.read.call(signal);
await temperature.write.call(signal, 21.5);

for await (const value of temperature.observe.values(signal)) {
  console.log(value); // every temperature change
}
```

`map` retypes the property with a bi-directional mapping: values read from, or observed through, the
returned property are mapped with `inOut`, while values written to it are mapped back with `outIn`.

```ts
const fahrenheit: PropertyAbilities<number> = temperature.map({
  inOut: (celsius) => celsius * 1.8 + 32,
  outIn: (fahrenheit) => (fahrenheit - 32) / 1.8,
});
```

`asReadonly` returns a readonly view of the property, without the `write` ability.

```ts
const readonlyTemperature: ReadonlyPropertyAbilities<number> = temperature.asReadonly();
```

Its structural counterpart is `HavingPropertyAbilities<GValue>`.

import type { AsyncFunction } from '@xstd/async-function';

export type SendAction<GArguments extends readonly unknown[]> = AsyncFunction<GArguments, void>;

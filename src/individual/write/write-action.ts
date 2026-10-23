import type { AsyncFunction } from '@xstd/async-function';

export type WriteAction<GValue> = AsyncFunction<[GValue], void>;

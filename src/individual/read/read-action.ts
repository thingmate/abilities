import type { AsyncFunction } from '@xstd/async-function';

export type ReadAction<GValue> = AsyncFunction<[], GValue>;

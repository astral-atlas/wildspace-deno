export type IsUnion<T, U extends T = T> =
    (T extends any ?
    (U extends T ? false : true)
        : never) extends false ? false : true

export type IsEqual<L, R> =
    Exclude<L, R> extends never
        ? Exclude<R, L> extends never ? true : false : false

export type ShortCircuit<Test, Fallback> = IsEqual<Test, never> extends true ? Fallback : Test;

export type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N; 

type A = IsEqual<'a', 'a' | 'b'>
import { If } from 'ts-toolbelt/out/Any/If';
import * as c from './core.ts';
import { IsEqual, ShortCircuit, IfAny } from './utils.ts';
import { Any } from 'ts-toolbelt'


type OfObjectType<T extends c.ObjectShape> = {
  readonly [key in keyof T["properties"]]: OfType<T["properties"][key]>
}
type OfArrayType<T extends c.ArrayShape> = readonly OfType<T["element"]>[];

type OfUnionType<T extends c.UnionShape> =
  IsEqual<T, any> extends true ? never :
  IsEqual<T, c.UnionShape> extends true ?
    never :
    OfType<T["of"][number]>;

type a = [
  OfUnionType<any>,
  OfUnionType<c.UnionShape>
]

/**
 * Convert a Shape into a Type!
 * 
 * You can use this to quickly generate Types from calls to
 * `def()`:
 * ```ts
 * import { s } from '@astral-atlas/pancake';
 * export const userDef = s.def({
 *  type: 'object',
 *  properties: { name: s.string },
 * })
 * export type User = s.OfType<typeof userDef>;
 * ```
 * 
 * Now you have a "runtime description" of the type
 * via the Shape, and a "type description" for your
 * IDE/LSP to autofill and typecheck
 */
export type OfType<T extends c.AnyShape> =
  If<Any.Equals<T, c.AnyShape>,
    c.ShapableType,
    | (T extends c.StringShape ? string : never)
    | (T extends c.NumberShape ? number : never)
    | (T extends c.BooleanShape ? boolean: never)
    | (T extends c.ArrayShape ? OfArrayType<T> : never)
    | (T extends c.ObjectShape ? OfObjectType<T> : never)
    | (T extends c.UnionShape ? OfUnionType<T> : never)
    | (T extends c.LiteralShape ? T["value"] : never)
  >

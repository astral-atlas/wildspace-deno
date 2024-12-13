declare const mutType: unique symbol;

/**
 * Just labels any type as "Mutable". Only for organising stuff.
 * 
 * Implies that you can just read and set the inner properties of
 * the data structure, without needing to notify anyone.
 * 
 * Typically this means that there is an "update" mechanism
 * somewhere else that runs on a timer that will just read this value.
 * */
export type Mutable<T extends {}> = T & { [mutType]: "mutable" };
export type Mut<T extends {}> = Mutable<T>;


/**
 * Label an arbitrary data structure as "mutable"
 * (only operates at a type level)
 * @param v 
 * @returns 
 */
export const mut = <T>(v: T): T & { [mutType]: "mutable" } => v as  T & { [mutType]: "mutable" };

export const Mutable = {
  set: mut,
}
export const Mut = Mutable;
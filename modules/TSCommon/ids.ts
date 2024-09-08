import { nanoid } from 'nanoid';

declare const idType: unique symbol;
export type OpaqueID<T extends string> = string & { [idType]: T };

export const generateId = <T extends string>(): OpaqueID<T> => nanoid() as OpaqueID<T>;

export const ids = {
  new: generateId
}
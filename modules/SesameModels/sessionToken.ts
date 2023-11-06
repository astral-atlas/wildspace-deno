import { m } from "./deps.ts";

export const sessionTokenDef = m.object({
  id: m.string,

  userId: m.string,
  secretId: m.string,
  expiry: m.number,

  lastUsed: m.number,
  name: m.string,
});
export type SessionToken = m.OfModelType<typeof sessionTokenDef>;
export type SessionTokenID = SessionToken["id"];

export const portableSessionTokenContentsDef = m.object({
  id: m.string,
  userId: m.string,
  secret: m.string,
}); 
export type PortableSessionTokenContents = m.OfModelType<typeof portableSessionTokenContentsDef>;

export const portableSessionTokenContentSerializer =
  m.createBinarySerializer<PortableSessionTokenContents>(portableSessionTokenContentsDef);

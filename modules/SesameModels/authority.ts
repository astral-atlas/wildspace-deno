import { m } from "./deps.ts";

export const identityRequestDefinition = m.object({
  username: m.string,
  password: m.string,
});

export type IdentityRequest = m.OfModelType<typeof identityRequestDefinition>;

export const identityAuthorizationDefinition = m.object({
  grantId: m.string,
  secret: m.string,
});

export type IdentityAuthorization = m.OfModelType<
  typeof identityAuthorizationDefinition
>;

export const identityGrantDefinition = m.union({
  user: m.object({
    type: m.literal("user"),
    grantId: m.string,
    userId: m.string,
  }),
  app: m.object({
    type: m.literal("app"),
    grantId: m.string,
    appId: m.string,
  }),
});

export type IdentityGrant = m.OfModelType<
  typeof identityGrantDefinition
>;

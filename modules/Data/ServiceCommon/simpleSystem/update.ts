import { channel, m } from "../deps.ts";
import { AssertEqual } from "./assert.ts";
import {
  SimpleSystemDefinition,
  SimpleSystemType,
  SimpleSystemTypeResource,
} from "./system.ts";

export type ChangeEvent<T extends SimpleSystemType> =
  | { type: "delete"; resource: SimpleSystemTypeResource<T> }
  | { type: "update"; update: T["update"]; resource: T["resource"] }
  | { type: "create"; create: T["create"]; resource: T["resource"] };
type a = AssertEqual<ChangeEvent<SimpleSystemType>, m.ModeledType>;
type b = AssertEqual<
  {
    type: "object";
    properties: {
      type: { type: "literal"; value: "delete" };
      resource: m.ModelOf2<SimpleSystemTypeResource<SimpleSystemType>>;
    };
  },
  m.ModelOf2<ChangeEvent<SimpleSystemType>>
>;

export const createChangeEventModel = <T extends SimpleSystemType>(
  definition: SimpleSystemDefinition<T>,
): m.ModelOf2<ChangeEvent<T>> => {
  return m.union2(
    [
      m.object({
        type: m.literal("delete"),
        resource: definition.models.resource,
      }),
      m.object({
        type: m.literal("update"),
        resource: definition.models.resource,
        update: definition.models.update,
      }),
      m.object({
        type: m.literal("create"),
        resource: definition.models.resource,
        create: definition.models.create,
      }),
    ] as const,
  ) as any;
};

export type UpdateChannel<T extends SimpleSystemType> = channel.UniformChannel<
  ChangeEvent<T>
>;
export type UpdateBand<T extends SimpleSystemType> = {
  message: ChangeEvent<T>;
  dial: { [key in T["partitionName"]]: string };
};
type AssertBand = AssertEqual<UpdateBand<SimpleSystemType>, channel.BandType>;

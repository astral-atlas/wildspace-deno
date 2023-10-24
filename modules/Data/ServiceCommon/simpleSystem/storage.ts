import { AssertEqual } from "./assert.ts";

import { storage } from "../deps.ts";
import { SimpleSystemType, SimpleSystemDefinition } from "./system.ts";

export type DynamoPartitionType<T extends SimpleSystemType> = {
  value: T["resource"],
  part: string,
  sort: string,
};
type TestPartitionType = AssertEqual<
  DynamoPartitionType<SimpleSystemType>,
  storage.DynamoPartitionType
>

export const createPartitionDefinition = <T extends SimpleSystemType>(
  definition: SimpleSystemDefinition<T>,
): storage.DynamoPartitionDefinition<DynamoPartitionType<T>> => ({
  partitionPrefix: definition.key,
  model: definition.models.resource
})

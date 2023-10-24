import { AssertEqual } from "./assert.ts";

import { storage } from "../deps.ts";
import { SimpleSystemType, SimpleSystemDefinition, TypeOfSimpleSystem } from "./system.ts";

export type DynamoPartitionType<T extends SimpleSystemType> = {
  value: T["resource"],
  part: string,
  sort: string,
};
type TestPartitionType = AssertEqual<
  DynamoPartitionType<SimpleSystemType>,
  storage.DynamoPartitionType
>
type Tests = {
  isSimpleSystem: AssertEqual<
    DynamoPartitionType<SimpleSystemType>,
    storage.DynamoPartitionType
  >,
  isExplicitSystemCompatibleWithGeneric: AssertEqual<
    DynamoPartitionType<{
      partitionName: string;
      sortName: string;
      resourceName: string;
      resource: string;
      create: string;
      update: string;
    }>,
    DynamoPartitionType<SimpleSystemType>
  >,
}


export const createPartitionDefinition = <T extends SimpleSystemType>(
  definition: SimpleSystemDefinition<T>,
): storage.DynamoPartitionDefinition<DynamoPartitionType<T>> => ({
  partitionPrefix: definition.key,
  model: definition.models.resource
})

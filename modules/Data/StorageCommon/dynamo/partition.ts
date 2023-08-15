import { createModelCaster } from "../../../Models/cast.ts";
import { ModelOf } from "../../../Models/model.ts";
import { dynamo } from "../deps.ts";
import { AttributeRecord, TypeOfAttributeValue, attributeMapToObject, objectToAttributeMap, valueToAttribute } from "./attributes.ts";
import { DynamoTableDefinition } from "./table.ts";

export type DynamoPartitionType = {
  value: { readonly [key: string]: TypeOfAttributeValue },
};

export type DynamoPartitionDefinition<T extends DynamoPartitionType> = {
  partitionPrefix: string,
  model: ModelOf<T["value"]>,
  partitionKey: keyof T["value"],
  sortKey: keyof T["value"],
}

export type DynamoQueryResults<T extends DynamoPartitionType> = {
  items: T["value"][];
};

export type DynamoPartitionClient<T extends DynamoPartitionType> = {
  put: (value: T["value"]) => Promise<void>;
  query: (partition: string, sort?: string) => Promise<DynamoQueryResults<T>>;
};

export const createDynamoPartitionClient = <T extends DynamoPartitionType>(
  table: DynamoTableDefinition,
  definition: DynamoPartitionDefinition<T>,
  client: dynamo.DynamoDBClient,
): DynamoPartitionClient<T> => {
  type Partition = T["value"][typeof definition.partitionKey];
  type Sort = T["value"][typeof definition.sortKey];

  const encodeKeyAttributes = (
    partition: Partition,
    sort?: Sort
  ) => {
    const partitionKey = {
      [table.partitionKeyName]: definition.partitionPrefix + partition,
    }
    if (!sort)
      return partitionKey;

    return {
      ...partitionKey,
      [table.sortKeyName]: sort,
    }
  }
  const encode = (value: T["value"]) => {
    return objectToAttributeMap({
      ...encodeKeyAttributes(
        value[definition.partitionKey],
        value[definition.sortKey],
      ),
      [table.valueKeyName]: value,
    });
  }
  const decode = (attributes: AttributeRecord) => {
    const map = attributeMapToObject(attributes);
    return cast(map[table.valueKeyName]);
  }
  const cast = createModelCaster(definition.model);

  return {
    async put(value: T["value"]) {
      await client.send(
        new dynamo.PutItemCommand({
          TableName: table.tableName,
          Item: encode(value),
        })
      );
    },
    async query(partition, sort) {
      const sortInput = sort && {
        KeyConditionExpression: `${table.partitionKeyName} = :partition AND ${table.sortKeyName} = :sort`,
        ExpressionAttributeValues: {
          ":partition": valueToAttribute(partition),
          ":sort": valueToAttribute(sort),
        },
      };
      const input = {
        TableName: table.tableName,
        KeyConditionExpression: `${table.partitionKeyName} = :partition`,
        ExpressionAttributeValues: { ":partition": valueToAttribute(partition) },
        ...(sortInput || {}),
      }

      const results = await client.send(
        new dynamo.QueryCommand(input)
      );
      if (!results.Items) return { items: [] };
      const items = results.Items.map((item) => decode(item));
      return { items };
    }
  };
};
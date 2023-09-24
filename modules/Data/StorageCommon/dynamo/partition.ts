import { Cast, castString, createModelCaster } from "../../../Models/cast.ts";
import { ModelOf, ModelOf2, OfModelType } from "../../../Models/model.ts";
import { dynamo } from "../deps.ts";
import { AttributeRecord, TypeOfAttributeValue, attributeMapToObject, objectToAttributeMap, valueToAttribute } from "./attributes.ts";
import { DynamoTableDefinition } from "./table.ts";

export type DynamoPartitionType = {
  value: { readonly [key: string]: TypeOfAttributeValue },
  part?: string | undefined | typeof anyPart,
  sort: string
};

declare const anyPart: unique symbol;
export type AnyDynamoPartitionType = {
  value: any,
  part: typeof anyPart,
  sort: string,
}
export type DynamoKey<T extends DynamoPartitionType> = {
  //part: T["part"] extends string ? T["part"] : undefined,
  sort: T["sort"],
} & DynamoPartitionKey<T>;

export type DynamoPartitionKey<T extends DynamoPartitionType> =
  T["part"] extends string ?
    { part: T["part"] }
    : T["part"] extends undefined ?
      { part?: undefined }
      : any

export type DynamoPartitionCondition =
  | 'equal' | 'less_than'
  | 'greater_than' | 'between'
  | 'begins_with'
export type DynamoPartitionQuery<T extends DynamoPartitionType> = (
  | { type: 'all' }
  | { type: 'equal', sort: string }
  | { type: 'less_than', sort: string }
  | { type: 'greater_than', sort: string }
) & DynamoPartitionKey<T>

export type DynamoPartitionDefinition<T extends DynamoPartitionType> = {
  partitionPrefix:  string,
  model:            ModelOf2<T["value"]>,
}

export type DynamoQueryResults<T extends DynamoPartitionType> = {
  value: T["value"];
  key: DynamoKey<T>;
}[];

const createQueryCommand = <T extends DynamoPartitionType>(
  query: DynamoPartitionQuery<T>,
  { partitionPrefix }: DynamoPartitionDefinition<T>,
  { partitionKeyName, sortKeyName, tableName }: DynamoTableDefinition
) => {
  const partition = partitionPrefix + (query.part || '');
  if (query.type === 'all')
    return new dynamo.QueryCommand({
      TableName: tableName,
      KeyConditionExpression: `${partitionKeyName} = :partition`,
      ExpressionAttributeValues: { ":partition": valueToAttribute(partition) },
    });
  
  const conditionSyntaxMap = {
    'equal':        '=',
    'less_than':    '<',
    'greater_than': '<',
  }
  const conditionSyntax = conditionSyntaxMap[query.type];
  return new dynamo.QueryCommand({
    TableName: tableName,
    KeyConditionExpression: `${partitionKeyName} = :partition AND ${sortKeyName} ${conditionSyntax} :sort`,
    ExpressionAttributeValues: {
      ":partition": valueToAttribute(partition),
      ":sort": valueToAttribute(query.sort),
    },
  });
}

export type DynamoPartitionClient<T extends DynamoPartitionType> = {
  definition: DynamoPartitionDefinition<T>,

  put: (key: DynamoKey<T>, value: T["value"] | null) => Promise<void>;
  delete: (key: DynamoKey<T>) => Promise<T["value"]>;
  get: (key: DynamoKey<T>) => Promise<T["value"]>;
  query: (query: DynamoPartitionQuery<T>) => Promise<DynamoQueryResults<T>>;
};

export const createDynamoPartitionClient = <T extends DynamoPartitionType>(
  table: DynamoTableDefinition,
  definition: DynamoPartitionDefinition<T>,
  client: dynamo.DynamoDBClient,
): DynamoPartitionClient<T> => {
  const decode = (attributes: AttributeRecord) => {
    const map = attributeMapToObject(attributes);
    return cast(map[table.valueKeyName]);
  }
  const cast = createModelCaster(definition.model) as Cast<T["value"]>;

  return {
    definition,
    async put(key, value) {
      const partition = definition.partitionPrefix + (key.part || '');
      await client.send(
        new dynamo.PutItemCommand({
          TableName: table.tableName,
          Item: objectToAttributeMap({
            [table.partitionKeyName]: partition,
            [table.sortKeyName]: key.sort,
            [table.valueKeyName]: value,
          })
        })
      );
    },
    async delete(key) {
      const partition = definition.partitionPrefix + (key.part || '');
      const { Attributes: Item } = await client.send(
        new dynamo.DeleteItemCommand({
          ReturnValues: 'ALL_OLD',
          TableName: table.tableName,
          Key: objectToAttributeMap({
            [table.partitionKeyName]: partition,
            [table.sortKeyName]: key.sort,
          })
        })
      );
      if (!Item)
        throw new Error();
      return cast(decode(Item));
    },
    async get(key) {
      const partition = definition.partitionPrefix + (key.part || '');
      const { Item } = await client.send(new dynamo.GetItemCommand({
        TableName: table.tableName,
        Key: objectToAttributeMap({
          [table.partitionKeyName]: partition,
          [table.sortKeyName]: key.sort,
        })
      }))
      if (!Item)
        throw new Error();
      return cast(decode(Item));
    },
    async query(queryInput) {
      const results = await client.send(
        createQueryCommand(queryInput, definition, table)
      );
      if (!results.Items)
        throw new Error();
      return results.Items
        .map((item) => decode(item))
        .map(item => ({
          key: {
            part: castString(item[table.partitionKeyName])
              .slice(definition.partitionPrefix.length),
            sort: castString(item[table.sortKeyName])
          } as unknown as DynamoKey<T>,
          value: cast(item[table.valueKeyName])
        }))
    }
  };
};
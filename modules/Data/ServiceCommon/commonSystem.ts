import { Cast } from "../../Models/cast.ts";
import { ModeledType } from "../../Models/model.ts";
import { rxjs } from "../SesameDataService/deps.ts";
import { CRUDService } from "./crudService.ts";
import { m, storage, channel } from "./deps.ts";

export type CommonSystemType = {
  partName: string;
  sortName: string;
  part: string;
  sort: string;
  resource: { [key: string]: m.ModeledType };
  editable: { [key: string]: m.ModeledType };
};
export type CommonSystemDefinintion<T extends CommonSystemType> = {
  partName: T["partName"];
  sortName: T["sortName"];
  names: ReadonlyArray<string>;
  resource: m.ModelOf2<T["resource"]>;
  editable: m.ModelOf2<T["editable"]>;
}
export type ToCommonSystemType<
  T extends CommonSystemDefinintion<CommonSystemType>
> = {
  part: string;
  sort: string;
  partName: T["partName"];
  sortName: T["sortName"];
  resource: m.OfModelType<T["resource"]>;
  editable: m.OfModelType<T["editable"]>;
};

export const createCommonSystemDefinition = <
  T extends CommonSystemType
>(
  def: CommonSystemDefinintion<T>
): CommonSystemDefinintion<T> => {
  return def;
};

export type CommonSystemOutputType<T extends CommonSystemType> = {
  service: {
    resource: T["resource"];
    create: T["editable"];
    update: T["editable"];
    id: { [key in T["partName"]]: T["part"] } & {
      [key in T["sortName"]]: T["sort"];
    };
    filter: { [key in T["partName"]]: T["part"] };
  };
  storage: {
    value: T["resource"];
    sort: T["sort"];
    part: T["part"] extends string ? T["part"] : string;
  };
  event: {
    item: T["resource"];
    action: "CREATE" | "UPDATE" | "DELETE";
  };
};
export type CommonSystemComponents<T extends CommonSystemType> = {
  service: CRUDService<CommonSystemOutputType<T>["service"]>;
  storage: storage.DynamoPartitionClient<CommonSystemOutputType<T>["storage"]>;

  channel: channel.OutgoingChannel<CommonSystemOutputType<T>["event"]>;
  changes: (filter: {
    [key in T["partName"]]: T["part"];
  } & {
    [key in T["sortName"]]?: T["sort"];
  }) => channel.IncomingChannel<CommonSystemOutputType<T>["event"]>;
};

export type CommonSystemServiceInput<T extends CommonSystemType> = {
  storage: CommonSystemComponents<T>["storage"];
  channel: CommonSystemComponents<T>["channel"];
  definition: CommonSystemDefinintion<T>;
  implementation: CommonSystemServiceImplementation<T>;
};

type OptionalAsync<T> = Promise<T> | T;

export type CommonSystemServiceImplementation<T extends CommonSystemType> = {
  create: (input: T["editable"]) => OptionalAsync<T["resource"]>;
  update: (previous: T["resource"], input: T["editable"]) => OptionalAsync<T["resource"]>;
  calculateKey: (input: T["resource"]) => {
    part: T["part"];
    sort: T["sort"];
  };
}

export const createCommonSystemChannels = <T extends CommonSystemType>(
  transportChannel: channel.UniformChannel<ModeledType>,
  definition: CommonSystemDefinintion<T>,
  calculateKey: (input: T["resource"]) => {
    part: T["part"];
    sort: T["sort"];
  },
): [CommonSystemComponents<T>["channel"], CommonSystemComponents<T>["changes"]] => {
  const castEvent = m.createModelCaster(m.object({
    action: m.set(["CREATE", "UPDATE", "DELETE"] as const),
    item: definition.resource,
  })) as Cast<CommonSystemOutputType<T>["event"]>;

  const close = () => {
    transportChannel.close();
  };
  const send = (event: CommonSystemOutputType<T>["event"]) => {
    transportChannel.send(event);
  };
  const changes: CommonSystemComponents<T>["changes"] = (params) => {
    const part = params[definition.partName];
    const sort = params[definition.sortName];
    const transportSubscription = transportChannel.recieve.subscribe((transportedData) => {
      const event = castEvent(transportedData);
      const key = calculateKey(event.item)
      if (key.part !== part)
        return;
      if (sort && (sort !== key.sort))
        return;
      recieve.next(event);
    });
    const recieve = new rxjs.Subject<CommonSystemOutputType<T>["event"]>();
    const close = () => {
      transportSubscription.unsubscribe();
    }
    
    return {
      close,
      recieve,
    }
  };
  const channel = {
    close,
    send,
  }

  return [channel, changes]
};

export const createCommonSystemStoreDefinition = <
  T extends CommonSystemType,
>(
  definition: CommonSystemDefinintion<T>,
): storage.DynamoPartitionDefinition<CommonSystemOutputType<T>["storage"]> => {
  return {
    partitionPrefix:  definition.names.join('/') + '/',
    model:            definition.resource,
  } as const;
};

export const createCommonSystemService = <T extends CommonSystemType>({
  storage,
  channel,
  definition,
  implementation,
}: CommonSystemServiceInput<T>): CommonSystemComponents<T>["service"] => {
  return {
    async create(creation) {
      const item = await implementation.create(creation);
      const keys = implementation.calculateKey(item);
      await storage.put(keys, item);
      channel.send({ item, action: "CREATE" });
      return item;
    },
    async update(id, update) {
      const previousItem = await storage.get({
        part: id[definition.partName],
        sort: id[definition.sortName],
      });
      const nextItem = await implementation.update(previousItem, update);
      await storage.put(
        {
          part: id[definition.partName],
          sort: id[definition.sortName],
        },
        nextItem
      );
      channel.send({ item: nextItem, action: "UPDATE" });
      return nextItem;
    },
    async list(filter) {
      const part = filter[definition.partName];
      const results = await storage.query({ part, type: "all" });
      return results.map((r) => r.value);
    },
    async read(id) {
      const part = id[definition.partName];
      const sort = id[definition.sortName];
      return await storage.get({ part, sort });
    },
    async delete(id) {
      const part = id[definition.partName];
      const sort = id[definition.sortName];
      const item = await storage.delete({ part, sort });
      channel.send({ item, action: "UPDATE" });
      return item;
    },
  };
};



export const assertIsSystem = <T extends CommonSystemType>(
  def: CommonSystemDefinintion<T>
) => {}
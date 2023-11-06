import { m, network } from "../ServiceCommon/deps.ts";
import { Components } from "./components.ts";
import { Service } from "./service.ts";
import { SimpleSystemType, SimpleSystemDefinition } from "./system.ts";

type ListQuery<T extends SimpleSystemType> =
  & { [key in T["partitionName"]]: string }
type Identify<T extends SimpleSystemType> =
  & { [key in T["partitionName"]]: string }
  & { [key in T["sortName"]]: string }

export type RESTTransactionTypes<T extends SimpleSystemType> = {
  create: {
    request: T["create"],
    response: T["resource"],
    query: Record<string, never>,
  },
  read: {
    request: null,
    response: T["resource"],
    query: Identify<T>,
  },
  update: {
    request: T["update"],
    response: T["resource"],
    query: Identify<T>,
  },
  delete: {
    request: null,
    response: T["resource"],
    query: Identify<T>,
  },
  list: {
    request: null,
    response: T["resource"][],
    query: ListQuery<T>,
  }
};
export type RESTTransactionDefinitions<T extends SimpleSystemType> = {
  [key in keyof RESTTransactionTypes<T>]: network.TransactionDefinition<
    RESTTransactionTypes<T>[key]
  >
}

export const createRESTTransactionDefinitions = <T extends SimpleSystemType>(
  definition: SimpleSystemDefinition<T>,
): RESTTransactionDefinitions<T> => {
  const identifyQuery = m.object({
    [definition.names.partition]: m.string,
    [definition.names.sort]: m.string,
  }) as m.ModelOf2<Identify<T>>;
  const listQuery = m.object({
    [definition.names.partition]: m.string,
  }) as m.ModelOf2<Identify<T>>;

  return {
    create: {
      path: definition.key,
      method: "POST",
      models: {
        request: definition.models.create,
        response: definition.models.resource,
        query: m.object({}),
      }
    },
    read: {
      path: [definition.key, 'by-id'].join('/'),
      method: "GET",
      models: {
        request: m.literal(null),
        response: definition.models.resource,
        query: identifyQuery,
      }
    },
    update: {
      path: definition.key,
      method: "PUT",
      models: {
        request: definition.models.update,
        response: definition.models.resource,
        query: identifyQuery,
      }
    },
    delete: {
      path: definition.key,
      method: "DELETE",
      models: {
        request: m.literal(null),
        response: definition.models.resource,
        query: identifyQuery,
      }
    },
    list: {
      path: definition.key,
      method: "GET",
      models: {
        request: m.literal(null),
        response: m.array(definition.models.resource) as m.ModelOf2<T["resource"][]>,
        query: listQuery,
      }
    },
  }
}

export const createRESTRoutes = <T extends SimpleSystemType>(
  components: Components<T>,
  definitions: RESTTransactionDefinitions<T>,
): network.Route[] => {
  const createRoute = network.createTransactionHTTPRoute(
    definitions.create,
    async ({ request }) => {
      const body = await components.service.create(request);
      return {
        status: 201,
        body,
        headers: {},
      };
    }
  )
  const readRoute = network.createTransactionHTTPRoute(
    definitions.read,
    async ({ query }) => {
      const body = await components.service.read(query);
      return {
        status: 200,
        body,
        headers: {},
      };
    }
  )
  const updateRoute = network.createTransactionHTTPRoute(
    definitions.update,
    async ({ request, query }) => {
      const body = await components.service.update(query, request);
      return {
        status: 202,
        body,
        headers: {},
      };
    }
  )
  const deleteRoute = network.createTransactionHTTPRoute(
    definitions.delete,
    async ({ query }) => {
      const body = await components.service.delete(query);
      return {
        status: 202,
        body,
        headers: {},
      };
    }
  )
  const listRoute = network.createTransactionHTTPRoute(
    definitions.list,
    async ({ query }) => {
      const body = await components.service.list(query);
      return {
        status: 200,
        body,
        headers: {},
      };
    }
  )
  const routes = [
    createRoute,
    readRoute,
    updateRoute,
    deleteRoute,
    listRoute,
  ];
  return routes;
}
export const createRemoteService = <T extends SimpleSystemType>(
  domain: network.DomainClient,
  definitions: RESTTransactionDefinitions<T>,
): Service<T> => {
  const clients = {
    create: network.createTransactionHTTPClient(definitions.create, domain),
    read: network.createTransactionHTTPClient(definitions.read, domain),
    update: network.createTransactionHTTPClient(definitions.update, domain),
    delete: network.createTransactionHTTPClient(definitions.delete, domain),
    list: network.createTransactionHTTPClient(definitions.list, domain),
  }

  return {
    async create(create) {
      const { body } = await clients.create({ request: create, query: {} })
      return body;
    },
    async read(identify) {
      const { body } = await clients.read({ request: null, query: identify })
      return body;
    },
    async update(identify,update) {
      const { body } = await clients.update({ request: update, query: identify })
      return body;
    },
    async delete(identify) {
      const { body } = await clients.delete({ request: null, query: identify })
      return body;
    },
    async list(filter) {
      const { body } = await clients.list({ request: null, query: filter })
      return body;
    },
  }
}
export const createRESTClient = createRemoteService;
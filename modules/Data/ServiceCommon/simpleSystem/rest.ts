import { m, network } from "../deps.ts";
import { Components } from "./components.ts";
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
    query: null,
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
        query: m.literal(null),
      }
    },
    read: {
      path: [definition.key + 'by-id'].join('/'),
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
): network.HTTPRoute[] => {
  const castCreateRequest = m.createModelCaster(
    definitions.create.models.request
  ) as m.Cast<T["create"]>;

  const createRoute = network.createJSONRoute({
    path: definitions.create.path,
    method: definitions.create.method,
    handler: async (request) => {
      const create = castCreateRequest(request.body);
      const body = await components.service.create(create);
      return {
        status: 200,
        body,
        headers: {},
      };
    }
  });
  const routes = [
    createRoute
  ];
  return routes;
}

export const createRESTClient = <T extends SimpleSystemType>(
  domain: network.DomainClient,
  definitions: RESTTransactionDefinitions<T>,
) => {
  const castCreateResponse = m.createModelCaster(
    definitions.create.models.response
  ) as m.Cast<T["resource"]>;

  const create = async (create: T["create"]) => {
    const httpResponse = await domain.request({
      path: definitions.create.path,
      method: definitions.create.method,
      query: null,
      headers: null,
      body: new Blob([new TextEncoder().encode(JSON.stringify(create))]).stream(),
    })
    if (!httpResponse.body)
      throw new Error(`No body!`);
    try {
      const jsonBody = JSON.parse(new TextDecoder().decode(await network.readByteStream(httpResponse.body)))
      return castCreateResponse(jsonBody);
    } catch (error) {
      console.error(
        new TextDecoder().decode(await network.readByteStream(httpResponse.body))
      )
      throw error;
    }
  }

  return {
    create,
  }
}
import { nanoid, network, m, sesameModels, base64 } from "./deps.ts";
import { transactions, Transactions } from "./transactions.ts";
import { SesameBackend } from "./backend.ts";

export const createRoutes = (backend: SesameBackend): network.Route[] => {
  const accessRoute = network.createTransactionHTTPRoute<
    Transactions["access"]
  >(transactions.access, async ({ request }) => {
    switch (request.type) {
      case "sign-in": {
        const user = await backend.service.validateUser(
          request.username,
          request.password
        );
        if (!user) return { status: 401, body: { bearerToken: null } };
        const { bearerToken } = await backend.service.createSession(
          user.id,
          request.computerName
        );
        return {
          status: 200,
          headers: {},
          body: {
            bearerToken,
          },
        };
      }
      case "sign-up": {
        const user = await backend.service.createUser(
          request.username,
          request.password
        );
        const { bearerToken } = await backend.service.createSession(
          user.id,
          request.computerName
        );
        return {
          status: 200,
          headers: {},
          body: {
            bearerToken,
          },
        };
      }
    }
  });
  return [accessRoute];
};

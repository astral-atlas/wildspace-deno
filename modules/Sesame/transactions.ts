import { m, network, sesameModels } from "./deps.ts";

export const transactions = {
  access: {
    path: '/access',
    method: 'POST',
    models: {
      request: m.object({
        type: m.set(['sign-up', 'sign-in'] as const),
        username: m.string,
        password: m.string,
        computerName: m.string,
      }),
      response: m.object({
        bearerToken: m.nullable(m.string),
      }),
      query: m.object({}),
    },
  },
} as const;

export type Transactions = {
  access: network.OfTransactionType<(typeof transactions)["access"]>,
}
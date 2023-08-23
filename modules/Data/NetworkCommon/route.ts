import { HTTPTransactionType } from "./http.ts";

export type HTTPTransactionHandler<T extends HTTPTransactionType> = {
  handle: (request: {
    query: T["query"],
    body: T["request"]
  }) => Promise<T["response"]>
}

// add security at the route level
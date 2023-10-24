import { m } from "./deps.ts";
import { HTTPMethod } from "./http/common.ts";

export type TransactionType = {
  request: m.ModeledType,
  response: m.ModeledType,
  query: null | Record<string, m.ModeledType>,
};

export type TransactionDefinition<T extends TransactionType> = {
  path: string,
  method: HTTPMethod
  models: {
    request: m.ModelOf2<T["request"]>,
    response: m.ModelOf2<T["response"]>,
    query: m.ModelOf2<T["query"]>,
  }
};

export type OfTransactionType<T extends TransactionDefinition<TransactionType>> = {
  request: m.OfModelType<T["models"]["request"]>,
  response: m.OfModelType<T["models"]["response"]>,
  query: m.OfModelType<T["models"]["query"]>,
}

import { Component, h, useEffect } from "@lukekaalim/act";
import { DocSheet } from "../../../ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../../../ComponentDoc/markdown.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import {
  JSONResourceDefinition,
  OfJSONResourceType,
  createJSONResourceClient,
  createJSONResourceTransactionDefinitions,
} from "./JSONResource.ts";
import { m } from "../deps.ts";
import { createFetchHTTPClient } from "./client.ts";
import { act } from "../../DataDoc/deps.ts";
import { JSONTransactionDefinition } from "./JSONTransaction.ts";
import { ModelVisualizer } from "../../../ModelDoc/ModelVisualizer.ts";

const type = {
  path: "/api/my-resource",
  name: "Hello",
  resource: m.object({
    prop: m.string,
    count: m.number,
  }),
  post: m.object({
    add: m.object({
      thing: m.string
    })
  }),
  patch: m.array(m.never),
  filter: m.object({
    userId: m.string,
  }),
  id: m.object({
    id: m.string,
  }),
};
type MyInferResource = OfJSONResourceType<typeof type>;
type AnyTransactionType = {
  request: Record<string, any>;
  response: Record<string, any>;
  query: Record<string, any>;
};

const transactionTemplateURL = (
  transaction: JSONTransactionDefinition<AnyTransactionType>
) => {
  const url = new URL(transaction.path, `https://example.com`);
  if (transaction.query.type === "never") return url.pathname;
  const search = Object.entries(transaction.query.properties)
    .map(([key, value], index) => [
      index !== 0 && '&',
      key,
      '=',
      h('i', {}, value.type)
    ])
  return [transaction.path, '?', search];
};

const TransactionDoc: act.Component<{
  transaction: JSONTransactionDefinition<AnyTransactionType>;
}> = ({ transaction }) => {
  if (transaction.response.type === "never")
    return null;
  return [
    h("h3", {}, [transaction.method, ' ', transactionTemplateURL(transaction)]),
    transaction.query.type !== "never" &&
      h(
        "article",
        { style: { display: "flex", flexDirection: "column", flex: 1 } },
        [
          h("h4", { style: { margin: 0 } }, "Query"),
          h(ModelVisualizer, { model: transaction.query }),
        ]
      ),
    h("div", { style: { display: "flex", flexDirection: "row" } }, [
      transaction.request.type !== "never" &&
        h("article",
          { style: { display: "flex", flexDirection: "column", flex: 1 } },
          [
            h("h4", { style: { margin: 0 } }, "Request"),
            h(ModelVisualizer, { model: transaction.request }),
          ]
        ),
      h("article",
        { style: { display: "flex", flexDirection: "column", flex: 1 } },
        [
          h("h4", { style: { margin: 0 } }, "Response"),
          h(ModelVisualizer, { model: transaction.response }),
        ]
      ),
    ]),
  ];
};

const ResourceDoc: Component<{ resource: JSONResourceDefinition<any> }> = ({ resource }) => {
  const transactions = createJSONResourceTransactionDefinitions(resource);

  return Object.values(transactions)
    .map(transaction => {
      return h(TransactionDoc, { transaction });
    })
}

const demos = {
  resource() {
    return h(ResourceDoc, { resource: type });
  },
};

export const networkCommonHttpDocs: DocSheet[] = [
  markdownToSheet("HTTPCommon", readme, demos, null, 'NetworkCommon'),
];

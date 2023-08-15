import { h, useRef, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { markdownToSheet, DocSheet } from "../../ComponentDoc/mod.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { createMemoryDynamoStore } from "../StorageCommon/mod.ts";
import { createStoredSesameDataService } from "./mod.ts";
import { models } from "./deps.ts";

const Demo = () => {
  const users = useRef(
    createMemoryDynamoStore<{ value: models.SesameUser }>({
      partitionKey: "id",
      sortKey: "id",
    })
  ).current;
  const secrets = useRef(
    createMemoryDynamoStore<{ value: models.SesameSecret }>({
      partitionKey: "id",
      sortKey: "id",
    })
  ).current;
  const sesame = useRef(createStoredSesameDataService(users, secrets)).current;

  const [allUsers, setAllUsers] = useState<models.SesameUser[]>([]);

  const onClick = async () => {
    const user = await sesame.addUser("Luke", "Kaalim");
    setAllUsers(users.memory());
    console.log(await sesame.getUser(user.id));
  };
  return [
    h("button", { onClick }, "Click"),
    h(
      "ol",
      {},
      allUsers.map((user) => h("li", {}, user.name))
    ),
  ];
};

const demos = {
  demo: Demo,
};

export const sesameDataServiceDocs: DocSheet[] = [
  markdownToSheet("SesameDataService", readme, demos),
];

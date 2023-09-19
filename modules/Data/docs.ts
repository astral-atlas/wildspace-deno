import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { networkCommonHttpDocs } from "./NetworkCommon/http/docs.ts";
import { serviceCommonDocs } from "./ServiceCommon/docs.ts";

export const dataDocs: DocSheet[] = [
  networkCommonHttpDocs,
  serviceCommonDocs,
].flat(1);

import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { networkCommonDocs } from "./NetworkCommon/docs.ts";
import { networkCommonHttpDocs } from "./NetworkCommon/http/docs.ts";
import { serviceCommonDocs } from "./ServiceCommon/docs.ts";

export const dataDocs: DocSheet[] = [
  networkCommonHttpDocs,
  networkCommonDocs,
  serviceCommonDocs,
].flat(1).map(s => ({ ...s, parentId: s.parentId || 'Pancake' }));

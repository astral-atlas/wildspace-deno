import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { networkCommonHttpDocs } from "./NetworkCommon/http/docs.ts";

export const dataDocs: DocSheet[] = [
  networkCommonHttpDocs,
].flat(1);

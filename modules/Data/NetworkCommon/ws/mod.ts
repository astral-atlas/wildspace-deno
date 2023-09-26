import { rxjs } from "../deps.ts";

export type WSRequest = {
  path: string,
  headers: { [name: string]: string }
}
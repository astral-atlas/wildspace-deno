import { SesameUserID } from "./user.ts";

export type SesameAppID = string;
export type SesameApp = {
  id: SesameAppID,
  name: string,
  owner: SesameUserID,
  type: 'first-part' | 'third-party'
};
export const appDefinition = {
  
}
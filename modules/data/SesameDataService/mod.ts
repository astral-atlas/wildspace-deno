import { SesameUser } from "../../SesameModels/mod.ts";

export type SesameDataService = {
  addUser: () => Promise<SesameUser>,

  listUsers: () => Promise<SesameUser[]>,

  validateUser: (id: SesameUser, secret: string) => Promise<boolean>,
};

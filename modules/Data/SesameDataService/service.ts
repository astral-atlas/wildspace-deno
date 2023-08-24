import { AppService, createStoredAppService } from "./apps.ts";
import { models, rxjs } from "./deps.ts";
import { SesameStores } from "./stores.ts";
import { UserService, createStoredUserService } from "./user.ts";

export type SesameDataService = {
  user: UserService;
  apps: AppService;

  loginUser: (
    username: string,
    password: string
  ) => Promise<{ user: null | models.SesameUser }>;
};

export const createStoredSesameDataService = (
  stores: SesameStores,
  role: models.SesameRole
): SesameDataService => {
  return {
    user: createStoredUserService(role, stores),
    apps: createStoredAppService(role, stores),
    async loginUser(username, password) {
      const allusers = await stores.users.query({ type: "all" });
      const user = allusers
        .map((r) => r.value)
        .find((user) => user.name === username);
      if (!user) return { user: null };
      const secret = await stores.secrets.get({ sort: user.passwordSecretId });
      if (!secret) return { user: null };
      if (secret.value !== password) return { user: null };
      return { user };
    },
  };
};

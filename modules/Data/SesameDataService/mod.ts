import { SesameApp } from "../../SesameModels/app.ts";
import { SesameSecret } from "../../SesameModels/secret.ts";
import { SesameUser, SesameUserID } from "../../SesameModels/user.ts";
import { m } from "../NetworkCommon/deps.ts";
import { CRUDType } from "../ServiceCommon/crudService.ts";
import { AuthenticatedCRUDService, AuthenticatedMethod, UnauthenticatedMethod, UnauthorizedError, createAuthenticatedService } from "./auth.ts";
import { models, nanoid, network, rxjs, service, storage } from "./deps.ts";
import { SesameStores } from "./stores.ts";

export * from './stores.ts';
export * from './auth.ts';

const userServiceDefinition = service.createCRUDDefinition({
  path: '/users',
  name: 'Users',
  resource: models.userDefinition,
  create: m.object({ name: m.string, password: m.string }),
  update: m.object({ name: m.string }),
  id: m.object({ id: m.string }),
  filter: m.object({ }),
} as const);
type UserServiceType = service.TypeOfCRUDDefinition<typeof userServiceDefinition>;

const appServiceDefinition = service.createCRUDDefinition({
  path: '/apps',
  name: "Applications",
  resource: models.appDefinition,
  create: m.object({ name: m.string }),
  update: m.object({ name: m.string }),
  id:     m.object({ id: m.string }),
  filter: m.object({ userId: m.string }),
})
type AppServiceType = service.TypeOfCRUDDefinition<typeof appServiceDefinition>;

export type SesameDataService = {
  user: service.CRUDService<UserServiceType>,
  apps: service.CRUDService<AppServiceType>,

  userEvents: rxjs.Observable<{ user: models.SesameUser }>,
  loginUser: (username: string, password: string) => Promise<{ user: null | models.SesameUser }>,
};

const createStoredUserService = (
  role: models.SesameRole,
  stores: SesameStores
): SesameDataService["user"] => ({
  async create({ name, password }) {
    const passwordSecret: models.SesameSecret = {
      id: nanoid.nanoid(),
      value: password
    }
    await stores.secrets.put({ sort: passwordSecret.id }, passwordSecret)
    const user: models.SesameUser = {
      id: nanoid.nanoid(),
      name,
      passwordSecretId: passwordSecret.id
    }
    await stores.userNamesById.put({ sort: user.name }, { userId: user.id });
    await stores.users.put({ sort: user.id }, user);
    stores.userEvents.next({ user })
    return user;
  },
  async update({ id }, { name }) {
    const prevUser = await stores.users.get({ sort: id });
    const nextUser = {
      ...prevUser,
      name,
    }
    await stores.users.put({ sort: id }, nextUser)
    stores.userEvents.next({ user: nextUser })
  },
  async list() {
    const items = await stores.users.query({ type: 'all' });
    return items.map(item => item.value);
  },
  async delete({ id }) {
    await stores.users.delete({ sort: id })
  },
  async read({ id }) {
    return await stores.users.get({ sort: id });
  }
})

const createStoredAppService = (
  role: models.SesameRole,
  stores: SesameStores,
): SesameDataService["apps"] => ({
  async create({ name }) {
    if (role.type === 'guest')
      throw new UnauthorizedError()
    const app: SesameApp = {
      id: nanoid.nanoid(),
      owner: role.userId,
      name,
      type: role.type === 'user' ? 'third-party' : 'first-party',
    };
    await stores.apps.put({ part: app.owner, sort: app.id }, app);
    return app;
  },
  async update({ id }, { name }) {
    if (role.type === 'guest')
      throw new UnauthorizedError()
    const prevApp = await stores.apps.get({ part: role.userId, sort: id });
    if (role.userId !== prevApp.owner)
      throw new UnauthorizedError()
    const nextApp = {
      ...prevApp,
      name,
    }
    await stores.apps.put({ part: role.userId, sort: id }, nextApp);
  },
  async list({ userId }) {
    const items = await stores.apps.query({ type: 'all', part: userId });
    return items.map(item => item.value)
  },
  async delete({ id }) {
    if (role.type === 'guest')
      throw new UnauthorizedError()
    await stores.apps.delete({ part: role.userId, sort: id })
  },
  async read({ id }) {
    if (role.type === 'guest')
      throw new UnauthorizedError()
    return await stores.apps.get({ part: role.userId, sort: id });
  }
})

export const createStoredSesameDataService = (
  stores: SesameStores,
  role: models.SesameRole,
): SesameDataService => {
  return {
    user: createStoredUserService(role, stores),
    apps: createStoredAppService(role, stores),
    userEvents: stores.userEvents,
    async loginUser(username, password) {
      const allusers = await stores.users.query({ type: 'all' })
      const user = allusers
        .map(r => r.value)
        .find((user) => user.name === username)
      if (!user)
        return { user: null };
      const secret = await stores.secrets.get({ sort: user.passwordSecretId });
      if (!secret)
        return { user: null }
      if (secret.value !== password)
        return { user: null }
      return { user };
    }
  }
}

export type UnauthenticatedSesameDataService = {
  user: service.CRUDService<UserServiceType>,
  apps: service.CRUDService<AppServiceType>,

  userEvents: rxjs.Observable<{ user: models.SesameUser }>
  loginUser: UnauthenticatedMethod<SesameDataService["loginUser"]>,
};

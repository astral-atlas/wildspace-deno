import { m } from "../NetworkCommon/deps.ts";
import { models, nanoid, service } from "./deps.ts";
import { SesameStores } from "./stores.ts";

export const userServiceDefinition = service.createCRUDDefinition({
  path: "/users",
  name: "Users",
  resource: models.userDefinition,
  create: m.object({ name: m.string, password: m.string }),
  update: m.object({ name: m.string }),
  id: m.object({ id: m.string }),
  filter: m.object({}),
} as const);
export type UserServiceType = service.TypeOfCRUDDefinition<
  typeof userServiceDefinition
>;

export type UserService = service.CRUDService<UserServiceType>;

export const createStoredUserService = (
  role: models.SesameRole,
  stores: SesameStores
): UserService => ({
  async create({ name, password }) {
    const passwordSecret: models.SesameSecret = {
      id: nanoid.nanoid(),
      value: password,
    };
    await stores.secrets.put({ sort: passwordSecret.id }, passwordSecret);
    const user: models.SesameUser = {
      id: nanoid.nanoid(),
      name,
      passwordSecretId: passwordSecret.id,
    };
    await stores.userNamesById.put({ sort: user.name }, { userId: user.id });
    await stores.users.put({ sort: user.id }, user);
    stores.userEvents.next({ user });
    return user;
  },
  async update({ id }, { name }) {
    const prevUser = await stores.users.get({ sort: id });
    const nextUser = {
      ...prevUser,
      name,
    };
    await stores.users.put({ sort: id }, nextUser);
    stores.userEvents.next({ user: nextUser });
  },
  async list() {
    const items = await stores.users.query({ type: "all" });
    return items.map((item) => item.value);
  },
  async delete({ id }) {
    await stores.users.delete({ sort: id });
  },
  async read({ id }) {
    return await stores.users.get({ sort: id });
  },
});

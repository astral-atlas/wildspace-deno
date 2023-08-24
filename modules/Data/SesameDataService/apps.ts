import { m } from "../NetworkCommon/deps.ts";
import { UnauthorizedError } from "./auth.ts";
import { models, nanoid, service } from "./deps.ts";
import { SesameStores } from "./stores.ts";

export const appServiceDefinition = service.createCRUDDefinition({
  path: '/apps',
  name: "Applications",
  resource: models.appDefinition,
  create: m.object({ name: m.string }),
  update: m.object({ name: m.string }),
  id:     m.object({ id: m.string }),
  filter: m.object({ userId: m.string }),
})
export type AppServiceType = service.TypeOfCRUDDefinition<typeof appServiceDefinition>;

export type AppService = service.CRUDService<AppServiceType>;

export const createStoredAppService = (
  role: models.SesameRole,
  stores: SesameStores,
): AppService => ({
  async create({ name }) {
    if (role.type === 'guest' || role.type === 'application')
      throw new UnauthorizedError()
    const app: models.SesameApp = {
      id: nanoid.nanoid(),
      owner: role.userId,
      name,
      type: role.type === 'user' ? 'third-party' : 'first-party',
    };
    await stores.apps.put({ part: app.owner, sort: app.id }, app);
    return app;
  },
  async update({ id }, { name }) {
    if (role.type === 'guest' || role.type === 'application')
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
    if (role.type === 'guest' || role.type === 'application')
      throw new UnauthorizedError()
    await stores.apps.delete({ part: role.userId, sort: id })
  },
  async read({ id }) {
    if (role.type === 'guest' || role.type === 'application')
      throw new UnauthorizedError()
    return await stores.apps.get({ part: role.userId, sort: id });
  }
})
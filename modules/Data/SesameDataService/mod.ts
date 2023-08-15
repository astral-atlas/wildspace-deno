import { SesameSecret } from "../../SesameModels/secret.ts";
import { SesameUser } from "../../SesameModels/user.ts";
import { models, nanoid, network, storage } from "./deps.ts";

export type SesameDataService = {
  addUser: (name: string, password: string) => Promise<models.SesameUser>,
  getUser: (id: models.SesameUserID) => Promise<models.SesameUser>,
  validateUser: (id: models.SesameUserID, secret: string) => Promise<boolean>,
};

export const userPartitionDefinition = {
  partitionPrefix: 'user',

  model: models.userDefinition,
  partitionKey: 'id',
  sortKey: 'id',
} as const;

export const createStoredSesameDataService = (
  userStore: storage.DynamoPartitionClient<{ value: SesameUser }>,
  secretStore: storage.DynamoPartitionClient<{ value: SesameSecret }>,
): SesameDataService => {
  const addUser = async (name: string, password: string) => {
    const passwordSecretId = nanoid.nanoid(32);
    const passwordSecret = { id: passwordSecretId, value: password };
    await secretStore.put(passwordSecret)
    const userId = nanoid.nanoid(32);
    const user = { id: userId, name, passwordSecretId };
    await userStore.put(user);
    return user;
  };
  const getUser = async (id: models.SesameUserID) => {
    const { items } = await userStore.query(id);
    return items[0];
  };
  const validateUser = async (id: models.SesameUserID, providedSecret: string) => {
    const { items: users } = await userStore.query(id);
    const user = users[0];
    const { items: secrets } = await secretStore.query(user.passwordSecretId);
    const realSecret = secrets[0];
    return providedSecret === realSecret.value; 
  };

  return { addUser, getUser, validateUser };
}

export const createClientSesameDataService = (
  userEndpoint: network.RESTResource<{
    resource: models.SesameUser,
    post: { name: string, password: string },
    id: { id: models.SesameUserID }
  }>,
  validationEndpoint: network.RESTResource<{
    resource: boolean,
    post: { id: models.SesameSecretID, secret: string }
  }>,
): SesameDataService => ({
  async addUser(name, password) {
    return await userEndpoint.post({ name, password })
  },
  async getUser(id) {
    return await userEndpoint.get({ id })
  },
  async validateUser(id, secret) {
    return await validationEndpoint.post({ id, secret });
  },
})

export const createServerSesameDataService = (

) => {

}
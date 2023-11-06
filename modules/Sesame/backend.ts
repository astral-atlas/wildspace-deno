import { nanoid, simpleSystem, m, storage, sesameModels, base64 } from "./deps.ts";
import {
  userSystemDef,
  UserSystem,
  secretSystemDef,
  SecretSystem,
  sessionTokenDef,
  SessionTokenSystem,
} from "./systems.ts";

type NamePartition = {
  value: { name: string; userId: string };
  sort: string;
  part: string;
};

export type SesameBackend = {
  users: simpleSystem.Components<UserSystem>;
  secrets: simpleSystem.Components<SecretSystem>;
  sessionTokens: simpleSystem.Components<SessionTokenSystem>;
  names: storage.DynamoPartitionClient<NamePartition>;

  testSecretValue(
    valueToTest: string,
    secret: sesameModels.SesameSecret
  ): Promise<boolean>;

  service: BackendService,
};

export const createSesameBackend = (
  world: simpleSystem.World
): SesameBackend => {
  const nameDef = {
    partitionPrefix: "/sesame/names",
    model: m.object({
      name: m.string,
      userId: m.string,
    }),
  } as const;

  const names =
    world.partitionStorageProvider.createPartitionClient<NamePartition>(
      "names",
      nameDef
    );

  const users = simpleSystem.createComponents<UserSystem>(world, {
    definition: userSystemDef,
    service: {
      async create({ name, password }) {
        const userId = nanoid();
        const secret = await secrets.service.create({
          secretValue: password,
          userId,
        });

        return {
          id: userId,
          passwordSecretId: secret.id,
          name,
        };
      },
      async update(previous, input) {
        const updatePassword = async (newPassword: string) => {
          await secrets.service.delete({
            userId: previous.id,
            secretId: previous.passwordSecretId,
          });
          const newSecret = await secrets.service.create({
            userId: previous.id,
            secretValue: newPassword,
          });
          return newSecret.id;
        };

        const passwordSecretId = input.password
          ? await updatePassword(input.password)
          : previous.passwordSecretId;

        return {
          ...previous,
          passwordSecretId,
          name: input.name || previous.name,
        };
      },
      calculateKey(input) {
        return { part: "all", sort: input.id };
      },
    },
  });

  const hashSecret = async (secret: string, salt: string) => {    
    const buffer = new TextEncoder().encode(salt + secret);
    const digest = await crypto.subtle.digest("SHA-512", buffer);
    const hashed = new Uint8Array(digest);
    const base64Hash = btoa(String.fromCodePoint(...hashed));
    return base64Hash;
  };

  const testSecretValue = async (
    valueToTest: string,
    secret: sesameModels.SesameSecret
  ) => {
    return (await hashSecret(valueToTest, secret.salt)) === secret.value;
  };

  const secrets = simpleSystem.createComponents<SecretSystem>(world, {
    definition: secretSystemDef,
    service: {
      async create(input) {
        const salt = nanoid();
        const value = await hashSecret(input.secretValue, salt);

        return {
          id: nanoid(),
          userId: input.userId,
          salt,
          value,
        };
      },
      update() {
        throw new Error(`Secrets are immutable`);
      },
      calculateKey(input) {
        return {
          part: input.userId,
          sort: input.id,
        };
      },
    },
  });

  const sessionTokens = simpleSystem.createComponents<SessionTokenSystem>(
    world,
    {
      definition: sessionTokenDef,
      service: {
        calculateKey(input) {
          return { part: input.userId, sort: input.id };
        },
        create(input) {
          return {
            id: nanoid(),
            userId: input.userId,
            secretId: input.secretId,
            expiry: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
            lastUsed: Math.floor(Date.now() / 1000),
            name: input.name,
          };
        },
        update(previous, input) {
          switch (input.type) {
            case "expire":
              return { ...previous, expiry: 0 };
            case "use":
              return { ...previous, lastUsed: input.lastUsed };
          }
        },
      },
    }
  );

  const service: BackendService = {
    async createUser(username,password) {
      const existingUser = await names.get({ part: 'all', sort: username })
        .catch(() => null)
      if (existingUser)
        throw new Error(`Existing user with name ${username}`);

      const user = await users.service.create({
        name: username,
        password: password,
      });
      await names.put(
        { part: "all", sort: user.name },
        { name: user.name, userId: user.id }
      );
      return user;
    },
    async validateUser(username,password) {
      const { userId } = await names.get({
        part: 'all',
        sort: username
      })
      const user = await users.service.read({
        userId,
        userPartition: 'all'
      });
      const secret = await secrets.service.read({
        userId,
        secretId: user.passwordSecretId,
      })
      if (await testSecretValue(password, secret))
        return user;
      return null;
    },
    async createSession(userId,computerName) {
      const secret = nanoid();
      const sessionTokenSecret = await secrets.service.create({
        userId: userId,
        secretValue: secret,
      });
      const token = await sessionTokens.service.create({
        secretId: sessionTokenSecret.id,
        userId: userId,
        name: computerName,
      })
      const bearerToken = base64.encode(
        sesameModels
          .portableSessionTokenContentSerializer
          .encode({ id: token.id, userId: token.userId, secret })
      );
      return {
        token,
        secret,
        bearerToken,
      };
    },
    async validateSession(unsafeToken,secret) {
      const sessionToken = await sessionTokens.service.read({
        userId: unsafeToken.userId,
        tokenId: unsafeToken.id,
      });
      const sessionTokenSecret = await secrets.service.read({
        userId: sessionToken.userId,
        secretId: sessionToken.secretId,
      });
      if (await testSecretValue(secret, sessionTokenSecret)) {
        return await users.service.read({
          userId: sessionToken.userId,
          userPartition: 'all'
        });
      }
      return null;
    },
    async validateBearerToken(bearerToken) {
      const portableSessionTokenContent = sesameModels
        .portableSessionTokenContentSerializer
        .decode(new Uint8Array(base64.decode(bearerToken)));
      
      return await service.validatePortableSessionTokenContents(
        portableSessionTokenContent
      )
    },
    async validatePortableSessionTokenContents({ userId, id: tokenId, secret }) {
      const sessionToken = await sessionTokens.service.read({
        userId,
        tokenId,
      });
      const sessionTokenSecret = await secrets.service.read({
        userId: sessionToken.userId,
        secretId: sessionToken.secretId,
      });
      if (await testSecretValue(secret, sessionTokenSecret)) {
        return await users.service.read({
          userId: sessionToken.userId,
          userPartition: 'all'
        });
      }
      return null;
    }
  }

  return {
    service,
    names,
    users,
    secrets,
    sessionTokens,
    testSecretValue,
  };
};

export type BackendService = {
  createUser(
    username: string,
    password: string,
  ): Promise<sesameModels.SesameUser>,
  validateUser(
    username: string,
    password: string,
  ): Promise<null | sesameModels.SesameUser>,

  createSession(
    userId: sesameModels.SesameUserID,
    computerName: string,
  ): Promise<{ token: sesameModels.SessionToken, secret: string, bearerToken: string }>,
  validateSession(
    token: sesameModels.SessionToken,
    secret: string
  ): Promise<null | sesameModels.SesameUser>,
  validateBearerToken(
    bearerToken: string
  ): Promise<null | sesameModels.SesameUser>,
  validatePortableSessionTokenContents(
    portableSessionTokenContents: sesameModels.PortableSessionTokenContents
  ): Promise<null | sesameModels.SesameUser>
}
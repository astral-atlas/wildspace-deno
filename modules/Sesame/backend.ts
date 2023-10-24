import { nanoid, simpleSystem } from "./deps.ts";
import {
  userSystemDef, UserSystem,
  secretSystemDef, SecretSystem
} from "./systems.ts";


export type SesameBackend = {
  users: simpleSystem.Components<UserSystem>,
  secrets: simpleSystem.Components<SecretSystem>,
};

export const createSesameBackend = (
  world: simpleSystem.World,
): SesameBackend => {
  const users = simpleSystem.createComponents<UserSystem>(world, {
    definition: userSystemDef,
    service: {
      async create({ name, password }) {
        const userId = nanoid()
        const secret = await secrets.service.create({
          secretValue: password,
          userId
        })

        return {
          id: userId,
          passwordSecretId: secret.id,
          name,
        }
      },
      async update(previous, input) {
        const updatePassword = async (newPassword: string) => {
          await secrets.service.delete({
            userId: previous.id,
            id: previous.passwordSecretId
          });
          const newSecret = await secrets.service.create({
            userId: previous.id,
            secretValue: newPassword
          });
          return newSecret.id;
        }

        const passwordSecretId = input.password
          ? await updatePassword(input.password)
          : previous.passwordSecretId;

        return {
          ...previous,
          passwordSecretId,
          name: input.name || previous.name
        }
      },
      calculateKey(input) {
        return { part: 'all', sort: input.id }
      }
    },
  });

  const hashSecret = async (secret: string, salt: string) => {
    const buffer = new TextEncoder().encode(salt + secret);
    const hashed = new Uint8Array(await crypto.subtle.digest('SHA512', buffer))
    const base64Hash = btoa(String.fromCodePoint(...hashed))
    return base64Hash;
  }

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
        }
      },
      update() {
        throw new Error(`Secrets are immutable`);
      },
      calculateKey(input) {
        return {
          part: input.userId,
          sort: input.id,
        }
      },
    },
  });


  return { users, secrets };
};
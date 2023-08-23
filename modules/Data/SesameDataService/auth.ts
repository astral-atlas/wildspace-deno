import { models, nanoid, network, service, storage } from "./deps.ts";

export type AuthenticatedMethod<T extends (...args: any) => any> = (
  authorization: string,
  ...args: Parameters<T>
) => ReturnType<T>

export type UnauthenticatedMethod<T extends AuthenticatedMethod<(...args: any) => any>> = (
  ...args: Parameters<T> extends [Parameters<T>[0], ...infer R] ? R : never
) => ReturnType<T>

export type AuthenticatedCRUDService<T extends service.CRUDType> =
  service.CRUDServiceEnhancer<models.SesameRole, service.CRUDService<T>>

export const createAuthenticatedMethod = () => {

};

export const createAuthenticatedService = <T extends service.CRUDType>(
  service: AuthenticatedCRUDService<T>,
  role: models.SesameRole,
): service.CRUDService<T> => {
  return {
    create(create) {
      return service.create(role, create)
    },
    read(id) {
      return service.read(role, id)
    },
    update(id, update) {
      return service.update(role, id, update);
    },
    delete(id) {
      return service.delete(role, id);
    },
    list(filter) {
      return service.list(role, filter);
    },
  }
}

export class UnauthorizedError extends Error {}
import { shapes } from "./deps";

/**
 * A Storage interface that 
 */
export type GroupStore<T extends shapes.ShapableType> = {
  set: (groupId: string, itemId: string, item: T) => Promise<void>,
  retrieve: (groupId: string, itemId: string) => Promise<T>,
  remove: (groupId: string, itemId: string) => Promise<void>,
  list: (groupId: string) => Promise<ReadonlyArray<{ item: T, id: string }>>,
};

export const createGroupStore = <T extends shapes.ShapableType>(
  shape: shapes.OfShape<T>
): GroupStore<T> => {
  throw new Error();
}

const userDef = shapes.def({
  type: 'object',
  properties: { name: { type: 'string' } }
})

const userStore = createGroupStore<shapes.OfType<typeof userDef>>(userDef);

const user = await userStore.retrieve('one', 'oh-one');

user.name
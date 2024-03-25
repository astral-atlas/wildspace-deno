import * as shapes from './mod.ts';

const userDef = shapes.def({
  type: 'object',
  properties: {
    type: { type: 'literal', value: 'user' },
    name: { type: 'string' }
  }
} as const)

type User = shapes.OfType<typeof userDef>;

const maybe = <T extends shapes.AnyShape>(shape: T) => {
  return { type: 'union', of: [{ type: 'literal', value: null }, shape] } as const;
}

const maybeUserDef = maybe(userDef);

type MaybeUser = shapes.OfType<typeof maybeUserDef>;

type WashingMashine =
  shapes.OfShape<
    shapes.OfType<
      shapes.OfShape<
        shapes.OfType<
          shapes.OfShape<
            User
          >
        >
      >
    >
  >

const fromTheWash = (shape: WashingMashine, value: shapes.OfType<WashingMashine>) => {
  value.type;
  shape.properties.type.value;
}

const listTypes = <T extends shapes.AnyShape>(shape: T): { value: shapes.OfType<T> } => {
  const value = 'string' as shapes.OfType<T>;

  return { value };
}

const { value } = listTypes<WashingMashine>(userDef);
value.name

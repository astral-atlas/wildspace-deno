import { ModelOf2, ModeledType } from "./model.ts";

export const createDefaultValue = <T extends ModeledType>(model: ModelOf2<T>): T => {
  switch (model.type) {
    case 'string':
      return 'Sample String' as T;
    case 'object': {
      return Object.fromEntries(Object.keys(model.properties).map(key => {
        return [key, createDefaultValue<ModeledType>(model.properties[key])]
      })) as T;
    }
    case 'enum':
      return model.cases[0] as T;
    case 'union':
      return createDefaultValue<ModeledType>(Object.values(model.cases)[0]) as T;
    case 'union2':
      return createDefaultValue<ModeledType>(model.cases[0]) as T;
    case 'array':
      return createDefaultValue<ModeledType>(model.elements) as T;
    case 'literal':
      return model.value as T;
    case 'meta':
      return createDefaultValue<ModeledType>(model.value) as T;
    case 'nullable':
      return null as T;
    default:
      throw new Error();
  }
};

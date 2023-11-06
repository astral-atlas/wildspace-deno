import { Model, ModelOf2, ModeledType } from "./model.ts";

export type Serializer<Input, Output> = {
  encode: (input: Input) => Output;
  decode: (output: Output) => Input;
};

export type BinarySerializer<T, Size = number | "dynamic"> = Serializer<
  T,
  Uint8Array
> & {
  size: Size;
};

export const createBinarySerializer = <T extends ModeledType>(
  model: ModelOf2<T>
): BinarySerializer<T> => {
  const typeEraser = (): BinarySerializer<any> => {
    switch (model.type) {
      case "string":
        return stringSerializer;
      case "number":
        return numberSerializer;
      case "object": {
        return createObjectSerializer(
          Object.entries(model.properties).map(([name, propModel]) => ({
            name,
            model: propModel,
            serializer: createBinarySerializer<ModeledType>(propModel),
          }))
        );
      }
      case "enum":
        return createEnumSerializer(model.cases);
      case "literal":
        return createLiteralSerializer(model.value);
      default:
        throw new Error(`Unsupported Seralizer`);
    }
  };
  try {
    return typeEraser() as BinarySerializer<T>;
  } catch (error) {
    console.warn(error);
    throw error;
  }
};

const txtEnc = new TextEncoder();
const txtDec = new TextDecoder();

const stringSerializer: BinarySerializer<string> = {
  size: "dynamic",
  encode(input) {
    return txtEnc.encode(input);
  },
  decode(output) {
    return txtDec.decode(output);
  },
};
const numberSerializer: BinarySerializer<number, number> = {
  size: Float64Array.BYTES_PER_ELEMENT,
  encode(input) {
    const buf = new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT);
    const view = new DataView(buf);
    view.setFloat64(0, input);
    const bytes = new Uint8Array(buf);
    return bytes;
  },
  decode(output) {
    const floats = new DataView(output.buffer);
    const value = floats.getFloat64(0);
    return value;
  },
} as const;

const createObjectSerializer = (
  properties: {
    name: string;
    serializer: BinarySerializer<ModeledType>;
    model: Model;
  }[]
): BinarySerializer<Record<string, ModeledType>> => {
  return {
    size: "dynamic",
    encode(input) {
      const values = properties.map(({ serializer, name }) => {
        const value = serializer.encode(input[name]);
        if (serializer.size === "dynamic")
          return [...numberSerializer.encode(value.byteLength), ...value];
        return value;
      });
      return Uint8Array.from(values.map((v) => [...v]).flat(1));
    },
    decode(output) {
      let offset = 0;
      const readSize = () => {
        const end = offset + numberSerializer.size;
        const size = numberSerializer.decode(output.slice(offset, end));
        offset = end;
        return size;
      };
      const entries = properties.map(({ serializer, name }) => {
        const size =
          serializer.size === "dynamic" ? readSize() : serializer.size;
        const end = offset + size;
        const value = serializer.decode(output.slice(offset, end));
        offset = end;
        return [name, value];
      });
      return Object.fromEntries(entries);
    },
  };
};

export const createEnumSerializer = (
  cases: readonly string[]
): BinarySerializer<string> => {
  if (cases.length > 255)
    throw new Error(`Too many cases for binary protocol`);
  return {
    size: 1,
    encode(input) {
      const index = cases.indexOf(input);
      return Uint8Array.from([index]);
    },
    decode(output) {
      const index = output[0];
      return cases[index];
    },
  };
};


export const createLiteralSerializer = (
  value: string | number | boolean | null,
): BinarySerializer<string | number | boolean | null> => {
  return {
    size: 0,
    encode() {
      return new Uint8Array(0);
    },
    decode() {
      return value;
    },
  };
};


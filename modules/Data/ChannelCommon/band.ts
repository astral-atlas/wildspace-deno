import { UniformChannel } from "./channel.ts";
import { m } from "./deps.ts";
import { createEchoChannel } from "./memory.ts";

export type BandType = {
  message: m.ModeledType,
  dial: m.ModeledType,
}

export type Band<T extends BandType> = {
  connect: (dial: T["dial"]) => UniformChannel<T["message"]>,
};

export const createMemoryBand = <T extends BandType>(hashDial: (dial: T["dial"]) => string) => {
  const bands = new Map<string, UniformChannel<T["message"]>>();

  const connect = (dial: T["dial"]) => {
    const hash = hashDial(dial);
    const band = bands.get(hash) || createEchoChannel<T["message"]>();
    bands.set(hash, band);
    return band;
  }
  return { connect }
};
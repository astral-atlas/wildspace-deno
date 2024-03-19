import { useState } from "@lukekaalim/act";
import { act, threeCommon, three } from "./deps.ts";
import { randomElement, randomIntRange } from "../RandomThingGenerator/random.ts";
import { RoomObjectTree } from "./RoomObjectTree.ts";

export const DoorJourney: act.Component = () => {

  const riverRoom = threeCommon.useObjectResource('RiverRoom');
  const starfieldRoom = threeCommon.useObjectResource('StarfieldRoom');
  const mechaRoom = threeCommon.useObjectResource('MechaRoom');
  const foretRoom = threeCommon.useObjectResource('DenseForestRoom');

  const rooms = [foretRoom];
  const [roomIndex] = useState(randomIntRange(rooms.length - 1, 0))
  const room = rooms[roomIndex];

  if (!room)
    return null;

  return act.h(RoomObjectTree, { object: room })
}
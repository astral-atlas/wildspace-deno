import seedrandom from "https://esm.sh/seedrandom@3.0.5"

export const repeat = <T>(func: (index: number) => T, count: number): T[] =>
  Array.from({ length: count }).map((_, i) => func(i));

export const randomSlice = <T>(a: T[], minCount = 0): T[] => {
  const b = randomIntRange(a.length - 1);
  const c = randomIntRange(a.length - 1);

  const start = Math.min(b, c);
  const end = Math.max(b, c) + minCount;

  return a.slice(start, end);
}

export const randomIntRange = (max: number, min = 0, seed?: string): number => {
  return Math.round(min + (seedrandom(seed)() * (max - min)));
}

export const randomElement = <T>(array: ReadonlyArray<T>): T => {
  const i = randomIntRange(array.length - 1);
  return array[i];
}

export const randomGameName = (): string => [
  randomElement([
    "Battle of",
    "Duel at",
    "Showdown under",
    "Finale:",
    "Encounter with the",
  ]),

  randomElement([
    "Dark",
    "Bloody",
    "Legendary",
    "Scorching",
    "Wispy",
    "Ultimate",
    "Mysterious",
    "Imperial",
    "Familiar",
  ]),

  randomElement([
    "Lifeform",
    "Shadow Clone",
    "Goblins",
    "Foe",
    "Sunset",
    "Artefact",
    "Sword",
    "Curse",
  ])
].join(' ');


export const randomName = (): string => randomElement([
  "Veil of Shadows",
  "Vari the Able",
  "Vardette the Bardette",
  "Elara",
  "Mi Yooman",
  "Mórríghan Chalchiuhtlicue",
  "Amaya Saprai Karwasra"
]);

export const randomMonsterName = ()/*: string*/ => [
  randomElement(['Scary', 'Worried', 'Powerful', 'Deranged', "Quick", "Super", "Lava", "Acid", "Sentient"]),
  randomElement(['Dog', 'Cat', 'Tortise', 'Goblin', "Wizard", "Meteor", "Rock", "Slime"]),
].join(' ')

export const randomHumanName = ()/*: string*/ => [
  randomElement([
    "Luke",
    "Nicky",
    "Alex",
    "Tala",
  ]),
  randomElement([
    "Jase",
    "Anthony",
    "Martin",
    "Phillip",
    "Jane",
    "Riannah",
  ]),
  randomElement([
    "Kaalim",
  ])
].join(' ')

export const randomObjectName = ()/*: string*/ => [
  randomElement([
    "Long",
    "Short",
    "Tall",
    "Wide",
    "Expansive",
    "Compressed",
    "Mini",
    "Dire",
    ""
  ]),
  randomElement([
    "Colorful",
    "Dangerous",
    "Magical",
    "Corrupted",
    "Sentient",
    "Summoned",
    "Destroyed",
    "Evil",
    "\"The Rock\"",
    ""
  ]),
  randomElement([
    "Rock",
    "Boulder",
    "Tree",
    "Cover",
    "Building",
    "Stone",
    "Foiliage",
    "Tower",
    "Signpost",
  ]),
].filter(Boolean).join(' ')

export const randomSoftColor = ()/*: string*/ => {
  return `hsl(${Math.floor(Math.random() * 360)}deg, 40%, 80%)`;
}
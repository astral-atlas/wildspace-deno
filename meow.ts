const meows = "mEowMeowmEOwmEoWmEOwMEowmEOwMEowmEOwMEOWmeOwmeowmEOWmEowmEOwMeowmEOwmEoWmEOWmeOwmEOwmEoWmeOwmeoWmeOwmeowmEowMeoWmeOwmeowmEOwmeoWmEOwMEoWmeOwmeowmEOWmeOWmEOWmeowmEOwmEoWmEOwmeoWmEOwMeOWmEOwMeoWmEOwMEOwmEOwmEOWmeOwmeowmEOwMeoWmEOwMEOwmeOwmeowmEOwMEoWmEOwmEoWmEOwMEOWmEOWmEOWmEOWmeOWmeOwmeoWmeOwmeowmEowmeOWmEOwmeoWmEOwMEOwmeOwmeowmEOWMeoWmEOwMEOWmEOWmEoWmeOwmeowmEOWmEoWmEOwMEOwmEOwmEowmEOwmEoWmEOWmeOwmEOWmeOWmEOWmEowmEOwmeoWmEOwMEOwmEOwmEowmeOwmeowmEOwMEoWmEOwmEoWmeOWMEOWmeOWMEOWmeOwmeowmEowMeoWmEOwmEOwmeOwmeowmEOWMeoWmEOwMEOWmEOWmEoWmeOwmeowmEOwmeOWmEOwmeoWmEOwMEOwmeOwMEowmeOwmeowmEOwMeowmEOwmEoWmEOWmeOwmEOwmEoWmeOwmEOWmEOWmeOWmeOwmeowmEOwmeoWmeOwmeowmEOWmeOwmEOwmEoWmEOWmEOWmEOwmeoWmEOWmeOwmEOwmEowmeOwmeoWmeOwmeoWmeOwmeoWmeOwmeowmEowMEOWmEOwMEOwmEOwmEoWmeOwmeowmEOwMEOWmEOwmEOwmeOwmeowmEOwMEoWmEOWMeoWmeOwmeowmEOwmEOwmEOwmeoWmEOWmEOwmEOwMEOWmEOWmeOwmEOwMeoWmEOWmEowmEOwmEoWmeOwmeowmEOWmEOwmEOwMeoWmEOwmEowmEOwmEoWmEOwMEOWmEOWmeOWmeOwmeoWmeOwmeoWmeOwmeoWmeOwmeowmEOwMeowmEOWmEowmEOWmEowmEOWmeowmEOWmeOWmeOWMeOwmeOwMEOWmeOwMEOWmEOWMeoWmEOwMEOWmEOWmEoWmEOWmEowmEOWmEoWmeOwMEOwmEOwmeOwmEOwmEoWmeOwMEOWmEOwMEowmEoWMeowmEowMeOWmEowmEowmEOWmEoWmeOWmEOwmEOwmeOWmEOwmEowmEoWMeowmEowMEowmEowMeoWmeOWMEOWmEOWmeOWmEOwMeoWmeOWMEoWmeOWMeoWmEowmEOwmEoWMeoWmEoWMEOWmEOWmEOWmEowmeoWmEowmeoWmEowMeowmeOWmeOwmEOwmEoWmEowmeoWmEOwmEowmeOWmeowmEOwMEoWmEowMEOWmEOwMEow";

const meowShorts = [];
for (let i = 0; i < meows.length/4; i++) 
  meowShorts.push([...meows.slice(i*4, (i+1)*4)])

const isUpper = (x: string) => x.toUpperCase() === x;

const meowToBits = (meow: string[]) => {
  return meow
    .map(isUpper)
    .map(x => x ? 1 : 0)
    .reverse()
}
const bitsToHex = (bits: (1 | 0)[]) => {
  return bits
    .map((value, index) => value * Math.pow(2, index))
    .reduce((acc, curr) => acc + curr)
}

const message = meowShorts.map(meowToBits).map(bitsToHex).map(v => v.toString(16)).join("")

console.log(message)
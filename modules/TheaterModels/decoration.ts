import { m } from "./deps.ts";

export const decorationDefinition = m.union({
  'theater_object': m.object({
    type: m.literal('theater_object'),
  })
})
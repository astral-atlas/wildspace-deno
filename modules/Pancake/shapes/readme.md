# Shapes

```
import { shapes, s } from '@astral-atlas/pancake';
```

Shapes are a library for typesafe
runtime data structure definition.

You can use Shapes to describe a data structure,
convert it to a Typescript type. This means you have
a consistent definition of your data structure thats
accessible via typechecking, as well as at runtime.

This means you can easily:
  - Build a typesafe serializer that can convert
    any "shape" into a binary representation, and
    rehydrate it at the other end
  - Build typesafe validators that confirm unknown
    objects match a "Shape"s requirements
  - Generate console logs or documentation about
    the types your application uses.
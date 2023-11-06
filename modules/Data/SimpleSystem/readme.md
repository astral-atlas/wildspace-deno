# Simple System

  - [About](#about)
  - [Getting Started](#getting-started)
  - [World](#getting-started)
  - [Definition](#definition)
  - [Implementation](#implementation)
  - [HTTP/REST](#http-rest)
  - [Atoms](#atoms)
  - [Service](#service)

## About

Simple System is a set of modules and functions
that abstracts together several related services
that are commonly used together to store/retrieve a single
type of resource in a database.

> `TODO: wording`

Given a [world](#world), a [definition](#definition),
and a [implementation](#implementation), a simple system
can produce you a set of "Components". A component
is a service with functions to create, update, delete, list,
or read from a database, or listen to updates
from any other call to those functions, and specific
listeners to subscribe to a partition of those resources.

## Getting Started

You probably just want to start by modeling
the type of data that will play the role of
a "Resource".
```ts
const surfboardDef = m.object({
  id: m.string,
  ownerId: m.string,
  color: m.set(['sky-blue', 'fire-red'] as const)
});
```

Resources only need to meet three reqirements:
  - They must be a "ModeledType" (aka serializable)
  - They must have a property that groups them.
  - They must have a property that uniquly "identifies" them inside that group.

In our case, we'll group surfboards by their "owner",
so the owner can easily query how many surfboards they
have. We'll also "identify" them using a unique id.

> **Grouping**
>
> SimpleSystem's resources more technically must have
> a "partition key". Data with the same partition key
> is kept together, so can be queried easily.

Once we've modeled our resource, we can create our
definition:

```ts
const surfboardSystemDef = {
  key: 'SurfboardSystem',
  names: {
    partition: 'ownerId',
    sort: 'id',
    resource: 'surfboard'
  },
  models: {
    resource: surfboardDef,
    create: m.object({
      ownerId: surfboardDef.properties.ownerId,
      color: surfboardDef.properties.color,
    }),
    update: m.object({
      color: surfboardDef.properties.color,
    }),
  }
} as const
type SurfboardSystem = TypeOfSimpleSystem<
  typeof surfboardSystemDef
>;
```

Alongside with the surfboard system, we also
create a "SimpleSystemType" (which we just called
SurfboardSystem).

We've also created some models for "create" and
"update" - these data types will be used in
functions that change our surfboard. We also
defined some "names", though those are just for
aesthetic later and don't need to directly equal
any existing property names.

Now that we've defined our system,
we can create some components for it:

```ts
const world = createMemoryWorld()

const surf = createComponents<SurfboardSystem>(
  world,
  {
    definition: surfboardSystemDef,
    service: {
      create(input) {
        return {
          id: uuid(),
          ownerId: input.ownerId,
          color: input.color,
        }
      },
      update(resource, input) {
        return {
          ...resource,
          color: input.color,
        }
      },
      calculateKey(input) {
        return {
          part: input.ownerId,
          sort: input.id,
        }
      }
    }
  }
)
```

And now we have our surf system!

## World

Includes methods to
create "basic resources" such as
[partition storage clients](),
[channels]() and [bands]().

"World" acts as a gateway for the system
to interact with side effects like databases
and event systems, but also acts as an encapsulating
mechanism - allowing you to easily replace
the world with a mock world for testing or demonstration.


## Definition

```ts
export type SimpleSystemDefinition<T extends SimpleSystemType> = {
  key: string,
  names: {
    partition: T["partitionName"],
    sort: T["sortName"],
    resource: T["resourceName"]
  },
  models: {
    resource: SimpleSystemTypeResourceModel<T>,
    create: m.ModelOf2<T["create"]>,
    update: m.ModelOf2<T["update"]>,
  }
}
```

The definition object drives the type system,
providing [models]() and strings that will define
the constants and variables used inside the system.

## Implementation

A set of "implementation" functions needs to be
provided so some logic can be performed with the
type definitions - actions like "creating the resource"
and "updating the resource" sometimes have third-party
dependencies, or require "random" generation that isnt
part of the "create" request.

## HTTP/REST

SimpleSystem also defines a method for generating
HTTP Routes and Clients for performing transactions
against those routes.

## Atoms

Before the service is loaded, there are some
"dependant" internal services that need to be set
up - these are called to "atoms" or the "atomic
services".

> Because they will be "combined" together in
> the service to form the "molecule".

### Storage

### Update

## Service
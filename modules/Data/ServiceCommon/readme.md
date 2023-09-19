# Service Common

The Service Common library contains some utility functions
and types to help make building many services uniform and
simple. It does this mostly via requirming implements to build
"definition" objects, which model various aspects of the described
services. Feeding these objects to this libraries utility functions
can cause it to extrapolate dependencies and functionality.

## CRUD

Or "Create, Read, Update, Destroy" - this
is an abstract service that operates on a specific
collection of a single type of resource.

We define a common abstract service (and
service definition) to allow a uniform
API across HTTP/REST endpoints, javascript
client libraries, test clients and backend
implementations - using generic types and
static models to provide a consistent set
of *verbs* and *nouns*.

## Common System

> TODO: Rename to SimpleSystem

Common System is an abstract set of types and tools
to build fairly standard "resource" components, from
channels to hear about updates to those resources,
to CRUD Services to update and query them, and of course
to produce REST endpoints based off a short definition object.

```ts
const strokeSystemDefinition = service.createCommonSystemDefinition({
  names: ["dryerase", "whiteboard", "stroke"],
  resource: strokeDefinition,
  partName: "whiteboardId",
  sortName: "strokeId",
} as const);

type StrokeSystemType = service.ToCommonSystemType<
  typeof whiteboardStrokeServiceDefinitition
>;
```

Common Systems have a couple of properties that allows us to
extrapolate all this:

 - They _must_ have a "parent" of some kind with a stable id.
 - They _must_ have a unique id of their own.
 - They _must_ be JSON serializable.
 - They _must_ have a create-update-destroy lifecycle

By "parent" we mean that this is really a collection-in-collection
abstraction. As an example: Documents can't exist in a void - Documents
belong to a User. Similarly, Paragraphs must belong to Documents and such.

This system makes _many_ assumptions about the
properties and qualities of the item, but as a trade off it's
fairly easy to extend the "CommonSystem" definition to add on
new requirements, like authentication and such.

CommonSystem can currently provide the following components:

 - [x] **DynamoDBPartition Definition**.  Allows the creation of real (or fake) dynamoDB clients that can correctly serialize or deserialize data.
 - [x] **CRUDService**. Provides Create/Update/Delete/List/Get functionality.
 - [ ] **RESTEndpoint Definition** Allows the creation of a set of HTTP endpoints and clients that can communicate via those routes.
 - [ ] UpdateChannel
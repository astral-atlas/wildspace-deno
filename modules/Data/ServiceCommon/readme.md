# Service Common

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
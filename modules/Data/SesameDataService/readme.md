# Sesame Data Service

### SesameService

This object exposes methods at allow
you to asynchonously query, watch,
or update the SesameService.

There are multiple types of SesameService
you may encounter: ones that exist
simply to forward you requests to the backend,
ones that exist for testing purposes, storing
their data in memory, or ones that manipulate
a set of data "stores" to consistently retrieve
data from various intergrations.

This sesame service assumes you'll be making
requests from a single [*role*](./SesameModels#role) that will have
been assigned earlier.

#### Add User :service_demo{action=addUser}

Create a new user by providing a username and password.

```
username: Luke
password: secret
```

TODO

 - [ ] Collision checks for duplicate usernames
 - [ ] Rejection of low sec passwords

### SesameStore

The sesame store represents various low-level
drivers that store specific slices of state.

Typically implementations will be abstractions
over third-party databases, memory stores,
file systems or external API's.

::store_demo

# Sesame Models

Data structures used for the sesame service.

## User {#user}

Sesame's idea of a user. Retrieval is either via
userId or username.

::type{name=user}

## App {#app}

A third or first-party external app that
can query Sesame for information about a
token authentication request.

::type{name=app}

## Secret {#secret}

Abstract representation of something
that shouldn't be exposed to the public.

::type{name=secret}

## Role {#role}

When making API requests, a requester
can be categorised into a role internally
by the API.

::type{name=role}

## IdentityRequest {#identityRequest}

This data type is used internally
within sesame to represent a human-entered
request to validate their identity.

Typically this is exchanged for an
[IdentityAuthorization](#identityAuthorization).

::type{name=identityRequest}

## IdentityAuthorization {#identityAuthorization}

This data type can be used to claim an identity,
referencing [a grant](#identityGrant) and a secret
only the grant holder would know.

::type{name=identityAuthorization}

## IdentityGrant {#identityGrant}

Data type for recording different clients
that assume various roles.

A single
user may have multiple identity grants
if they are logged in on multiple
computers, or the same application
may have multiple grants for different
servers.

::type{name=identityGrant}
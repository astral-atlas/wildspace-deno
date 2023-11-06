# Sesame

The Wildspace authentication service.

## Concepts

Authentication is handled over a few stages:

### Access Stage

First, a user creates an account (A `SesameUser`)
with a username and password. That user is given
a unique userId as well as a session token (`SessionToken`).

If the user tries to connect using a new browser,
they'll need to re-input the same username and password and
they should recieve a different session token.

### Validation Stage

Then, when the user attempts to access a "resource" that
requires authentication, they can pass the session token
as part of the request via the Authorization header (as a
`Bearer Token`). If they are making a WebSocket connection,
they may need to pass their session token via 

The resource service then checks to see if
the session token is "valid" (`backend.validateSession()`)
(via a secret that comes with
the session token, and an expiry value that it compares
to the current time).

Finally, if the session token is valid, the service then
knows details about that user and can choose to allow or
deny requests to that resource.

### Control Stage

After a period of time, the "session token" will become invalid.
Alternativley, the client can request a list of all active session
tokens, and invalidate any manually. (Or of course, invalidate the
current session token by "logging out")

## Service

::Demo
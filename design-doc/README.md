Teleport Frontend Application Developer Challenge
=================================================

As stated in Teleport's [challenge documentation][xdszuh], this challenge
implements a basic file browser as a client/server. The client is an SPA
(Single Page Application) which communicates with an HTTP server supplying the
directory contents. Requests for directory contents will be authenticated with
a username and password.

I'll split the challenge into two projects: the client and the server. Both
projects will be implemented in Typescript. They will both use build toolchains
consisting of:

- GNU Make
- yarn
- webpack
- babel
- typescript
- prettier
- eslint

[xdszuh]: https://github.com/gravitational/careers/blob/18be4e4073ad42f713691d4b11e2a971b84e1ad2/challenges/frontend/challenge.md


Client
======

## Dependencies

- React: required by the challenge (but I'd probably use it anyway)
- Redux: not strictly required, but I like its reducer pattern and I think the
  Redux DevTools extension is helpful in development

Components will be implemented with JSX.

## Routes

### `/`

Since this is a basic demo app, `/` will redirect to `/login`.

### `/login`

Components:

- LoginForm: A basic username/password login form with a submit button. Error
  messages will be displayed in red.

<img src="./assets/Login.png" />
<img src="./assets/Login-error.png" />

### `/filebrowser/:filepath`

Components:

- FileBrowser: a container component
  - Breadcrumbs: a generic list of elements with a separator in between
  - DataGrid: a generic sortable table

Breadcrumbs Mockup:

<img src="./assets/Breadcrumbs.png" />

DataGrid Mockup:

<img src="./assets/DataGrid.png" />

## Security Considerations

### Auth

Authentication and authorization will be handled using a bearer access token
gotten from the server's `/login` endpoint. The access token will be stored in
the browser's `localStorage` and passed in authenticated requests using the
`Authorization` HTTP header.

### CSRF (Cross-site request forgery)

CSRF attacks are not a concern for two reasons:

- There are no HTTP requests with side-effects, i.e. the server is stateless.
- Auth is handled manually with the `Authorization` header, rather than
  automatically with a cookie.

### XSS (Cross-site scripting)

- All DOM manipulation will be done using React. React escapes all HTML input
  as long as [dangerouslySetInnerHTML][vpnufi] is avoided.
- Protection from `javascript:` and `data:` URIs will be provided by setting a
  restrictive [Content Security Policy][tlfkfk].

[vpnufi]: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
[tlfkfk]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP


Server
======

## Dependencies

- node.js
- [express][kcrhfw]: It's the most popular HTTP server framework (last I
  checked) and I figure it'll cut down on some noise vs. coding directly against
  the node `http2.createServer` API.
- [argon2][cfwcpu]: implementation of OWASP's currently recommended password
  hashing function
- [jsonwebtoken][qdhapb]: library for creating/verifying JSON Web Tokens for
  user auth. JWTs are somewhat controversial so I'll attempt to give some rationale
  in the "Auth" section below.

[kcrhfw]: https://expressjs.com/
[cfwcpu]: https://www.npmjs.com/package/argon2
[qdhapb]: https://www.npmjs.com/package/jsonwebtoken

I'll also be including unit tests. Those will employ these development
dependencies:

- [mocha][hxxpec]: test runner
- [chai][ydmgmg]: assertion library

[hxxpec]: https://mochajs.org/
[ydmgmg]: https://www.chaijs.com/


## Endpoints

### `POST /api/login`

Request

```
{
  "username": "zach",
  "password": "hunter2"
}
```

Response

```
{
  "token": "eyJhbGciOiJFUzI1NiIsIn..."
}
```

Error

```
{
  "code": "${errorCode}"
}
```

`errorCode` can be:

- `"login/failed"`: the username doesn't exist or the supplied password was
  incorrect


### `GET /api/filebrowser/:filepath`

Request Headers

- `Authorization` (required): `Bearer ${token}`, where `token` is the value
  received from a previous invocation of `POST /api/login`

Parameters

- `filepath`: a `/`-separated absolute file path

Response

```
[
  {
    name: "teleport.go",
    sizeKb: 320,
    type: "file"
  },
  {
    name: "test.go",
    sizeKb: 3320,
    type: "file"
  }
]
```

Error

```
{
  "code": "${errorCode}"
}
```

`errorCode` can be:

- `"filebrowser/noEntry"`: the supplied `filepath` does not exist.
- `"auth/tokenExpired"`: The access token used in the request has expired.
- `"auth/tokenInvalid"`: The access token used in the request is invalid.


### `GET /*`

A GET request *not* starting with `/api/` will be interpreted as a request for a
static file. The root directory will be specified in an environment variable
`$CLIENT_ROOT`. This will be used to serve the build outputs of the client
such as "index.html", "index.js", "style.css", etc.

A request for a directory or a non-existent file will return the contents of
"index.html" to support reloading and bookmarking pushState-based client
routes.

> Security Note: will take special care to guard against requesting paths
  that lie outside $CLIENT_ROOT (e.g. using '..')


## Security Considerations

### MITM (man in the middle)

Per the default nowadays, the server will operate exclusively through HTTPS to
prevent man in the middle attacks. In development mode a self-signed
certificate will be generated.

### Password Storage

User accounts will be stored in a JSON file with the following structure:

```
[
  {
    "username": "zach",
    "passwordHash": "<hex-encoded hash>",
    "salt": "<hex-encoded salt>"
  }
]
```

Passwords will be hashed as follows:

1. The plaintext password will be hashed using SHA512. [This is a technique
   used by Dropbox to help defend against DoS attacks.][atpftb]
2. A random salt will be generated per-user. Length will be 128 bits (arbitrary
   choice; in a real application an optimal salt length could be computed using
   a [birthday problem approximation][jwgsnw]).
3. The SHA512 hash will be hashed again using **argon2id** with the random salt
   and parameters `m=37 MiB, t=1, p=1`, per current [OWASP
   recommendations][cjcbmz].
4. The resulting argon2id hash will be encrypted with an AES256
   [pepper][svzrcp].

[atpftb]: https://dropbox.tech/security/how-dropbox-securely-stores-your-passwords
[jwgsnw]: https://en.wikipedia.org/wiki/Birthday_problem#Probability_table
[cjcbmz]: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
[svzrcp]: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#peppering


### Auth

Authentication and authorization will be performed using JWTs (JSON Web Tokens)
with a 1-hour expiration. In development mode a keypair will be generated for
JWT signing.

> Why JWTs? (tl;dr: my general desire to avoid state when possible) JWTs are a
  massively popular technique, so there's a fair bit of skepticism around their
  use. They may seem like overkill as a default choice given that their main
  use case is to enable verification of user auth in a microservices
  environment, i.e. without a central server/database. I'm choosing to use
  them here because they eliminate state that would otherwise need to be
  tracked/pruned: a list of active sessions. My goal is to have slightly less
  cognitive overhead and a lower chance of introducing state-related bugs.
  That's the theory anyhow.


Omissions
=========

I'm considering the following to be out of scope for this challenge. Please let
me know if any of these should be included!

Client:

- Production-mode build scripts
- Storybook tests

Server:

- Production-mode build scripts
- Database storage for users and directory listings (will use JSON files
  instead)
- Formal API documentation, e.g. Apiary
- Integration tests
- Containerization
- CI scripts

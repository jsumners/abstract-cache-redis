# abstract-cache-redis

This module provides a cache client that is compliant with the
[abstract-cache](https://github.com/jsumners/abstract-cache) protocol. This
client implements the `await` style of the protocol.

In addition to the API mandated by the protocol, the client exposes
`disconnect` and `quit` methods. These map to the
[ioredis](https://npm.im/ioredis) methods of the same names. These are only
useful if you create the client with connection configuration instead of an
already connected Redis client.

## Example

```js
// Create a client that uses ioredis to connect to `localhost:6379`.
const client = require('abstract-cache-redis')({ioredis: {}})

client.set('foo', 'foo', 1000)
  .then(() => client.has('foo'))
  .then(console.log) // true
  .then(() => client.quit())
  .catch(console.error)
```

## Options

The client factory accepts the an object with the following properties:

+ `client`: An already connected instance of `ioredis`.
+ `ioredis`: A regular `ioredis` configuration object.

Notes:

1. `client` takes precedence to `ioredis`.
1. At least one of the `client` or `ioredis` properties must be supplied.
1. The user is responsible for closing the connection.

## Tests

In order to run the tests for this project a local instance of Reis must
be running on port `6379`. A `docker-compose.yml` is included to facilitate
this:

```shell
$ docker-compose -d up
$ tap test/*.test.js
```

`npm test` automates the above.

## License

[MIT License](http://jsumners.mit-license.org/)

'use strict'

const Redis = require('ioredis')

function mapKey (inputKey, segment) {
  const parts = []
  if (typeof inputKey === 'string') {
    parts.push(encodeURIComponent(segment))
    parts.push(encodeURIComponent(inputKey))
  } else {
    parts.push(encodeURIComponent(inputKey.segment))
    parts.push(encodeURIComponent(inputKey.id))
  }
  return parts.join(':')
}

const proto = {
  delete: function (key) {
    const _key = mapKey(key, this._segment)
    return this._redis.del(_key)
  },

  disconnect: function () {
    return this._redis.disconnect()
  },

  get: function (key) {
    const _key = mapKey(key, this._segment)
    return this._redis.get(_key)
      .then((result) => {
        if (!result) return Promise.resolve(result)
        const _result = JSON.parse(result)
        const now = Date.now()
        const expires = _result.ttl + _result.stored
        const ttl = expires - now
        return Promise.resolve({
          item: _result.item,
          stored: _result.stored,
          ttl
        })
      })
  },

  has: function (key) {
    const _key = mapKey(key, this._segment)
    return this._redis.exists(_key).then((result) => Boolean(result))
  },

  quit: function () {
    return this._redis.quit()
  },

  set: function (key, value, ttl) {
    const _key = mapKey(key, this._segment)
    const payload = {
      item: value,
      stored: Date.now(),
      ttl
    }
    // Supposedly there is some sort of "PX" option for Redis's `set()` method,
    // but I have no idea how to use it. At least not with ioredis.
    return this._redis.set(_key, JSON.stringify(payload))
      .then(() => {
        const ttlSec = Math.max(1, Math.floor(ttl / 1000))
        return this._redis.expire(_key, ttlSec)
      })
  }
}

module.exports = function abstractCacheRedisFactory (config) {
  const _config = config || {}
  if (!_config.client && !_config.ioredis) throw Error('abstract-cache-redis: invalid configuration')

  const instance = Object.create(proto)
  const client = _config.client || new Redis(_config.ioredis)
  const segment = _config.segment || 'abstractCacheRedis'
  Object.defineProperties(instance, {
    await: {
      enumerable: false,
      value: true
    },
    _redis: {
      enumerable: false,
      value: client
    },
    _segment: {
      enumerable: false,
      value: segment
    }
  })
  return instance
}

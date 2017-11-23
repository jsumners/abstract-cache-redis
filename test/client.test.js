'use strict'

const test = require('tap').test
const MockIoredis = require('ioredis-mock')
const factory = require('../')

test('accepts a pre-existing ioredis connection', (t) => {
  t.plan(1)
  const client = factory({client: new MockIoredis()})
  client.set('foo', 'foo', 1000)
    .then(() => client.has('foo'))
    .then((result) => t.is(result, true))
    .catch(t.threw)
})

test('throws if invalid configuration', (t) => {
  t.plan(1)
  t.throws(() => factory())
})

test('has() returns false', (t) => {
  t.plan(1)
  const client = factory({client: new MockIoredis()})
  client.has('foo')
    .then((result) => t.is(result, false))
    .catch(t.threw)
})

test('delete() removes item', (t) => {
  t.plan(2)
  const client = factory({client: new MockIoredis()})
  client.set('foo', 'foo', 1000)
    .then(() => client.has('foo'))
    .then((result) => t.is(result, true))
    .then(() => client.delete('foo'))
    .then(() => client.has('foo'))
    .then((result) => t.is(result, false))
    .catch(t.threw)
})

test('get() returns `null`', (t) => {
  t.plan(1)
  const client = factory({client: new MockIoredis()})
  client.get('foo')
    .then((result) => t.is(result, null))
    .catch(t.threw)
})

test('get() returns an item', (t) => {
  t.plan(3)
  const client = factory({client: new MockIoredis()})
  client.set('foo', 'foo', 1000)
    .then(() => client.get('foo'))
    .then((result) => {
      t.type(result, Object)
      t.ok(result.item)
      t.is(result.item, 'foo')
    })
    .catch(t.threw)
})

test('object keys work', (t) => {
  t.plan(3)
  const client = factory({client: new MockIoredis()})
  client.set({id: 'foo', segment: 'bar'}, 'foo', 1000)
    .then(() => client.get({id: 'foo', segment: 'bar'}))
    .then((result) => {
      t.type(result, Object)
      t.ok(result.item)
      t.is(result.item, 'foo')
    })
    .catch(t.threw)
})

test('disconnect works', (t) => {
  t.plan(1)
  const client = factory({ioredis: {}})
  client.set('foo', 'foo', 1000)
    .then(() => client.disconnect())
    .then(t.pass)
    .catch(t.threw)
})

test('quit works', (t) => {
  t.plan(1)
  const client = factory({ioredis: {}})
  client.set('foo', 'foo', 1000)
    .then(() => client.quit())
    .then(t.pass)
    .catch(t.threw)
})

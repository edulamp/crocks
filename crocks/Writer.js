const constant    = require('../combinators/constant')
const isType      = require('../internal/isType')
const isFunction  = require('../internal/isFunction')
const isMonoid    = require('../internal/isMonoid')

const mconcat = require('../funcs/mconcat')

const wrapValue = x => Array.isArray(x) ? x.slice() : [ x ]

const _of   = x => Writer([], x)
const _type = constant('Writer')

function Writer(entry, val) {
  if(arguments.length !== 2) {
    throw new TypeError('Writer: Requires a log entry and a value')
  }

  const type    = _type
  const of      = _of
  const equals  = m => isType(type(), m) && m.value() === value()
  const value   = constant(val)
  const log     = constant(wrapValue(entry))

  const read = constant({
    log:    log(),
    value:  value()
  })

  function map(fn) {
    if(!isFunction(fn)) {
      throw new TypeError('Writer.map: requires a function')
    }

    return Writer(log(), fn(value()))
  }

  function ap(m) {
    if(!isFunction(value())) {
      throw new TypeError('Writer.ap: Wrapped value must be a function')
    }

    if(!isType(type(), m)) {
      throw new TypeError('Writer.ap: Writer required')
    }

    return chain(fn => m.map(fn))
  }

  function chain(fn) {
    if(!isFunction(fn)) {
      throw new TypeError('Writer.chain: function required')
    }

    const w = fn(value())
    return Writer(log().concat(w.log()), w.value())
  }

  function reduceLog(fn) {
    if(!isFunction(fn)) {
      throw new TypeError('Writer.reduceLog: Function required')
    }

    const l = log().length ? log().reduce(fn) : log()

    return Writer(l, value())
  }

  function mreduceLog(m) {
    if(!isMonoid(m)) {
      throw new TypeError('Writer.mreduceLog: Monoid required')
    }

    const l = log().length ? mconcat(m, log()).value() : log()

    return Writer(l, value())
  }

  return {
    type, read, value, log,
    equals, map, ap, of, chain,
    reduceLog, mreduceLog
  }
}

Writer.of   = _of
Writer.type = _type

module.exports = Writer
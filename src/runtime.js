import {
  __ as $,
  curry,
  curryN,
  defaultTo,
  either,
  equals,
  find,
  head,
  includes,
  last,
  pipe,
  propOr,
  toPairs,
} from 'ramda'
import rawParser from 'yargs-parser'

// .raincoatrc
//
// - exclude:
//   - node_modules/**
//   - build/**
// - size: 100
// - files: "**/*.*"
// - lines: 4
// - threshold: 95

export const yargsConfig = {
  alias: {
    exclude: ['x'],
    size: ['s'],
    files: ['i'],
    lines: ['l'],
    threshold: ['t'],
  },
  array: ['x'],
  number: ['s', 'l', 't'],
}

// wrap raw yargs-parser with curry
export const argsParser = curryN(2, rawParser)

// partially apply for default case
export const parse = argsParser($, yargsConfig)

export const getAlias = curry((yc, k) =>
  pipe(
    propOr({}, 'alias'),
    toPairs,
    find(either(pipe(head, equals(k)), pipe(last, includes(k)))),
    defaultTo([k]),
    head
  )(yc)
)

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
  mergeRight,
  pipe,
  propOr,
  reduce,
  toPairs,
} from 'ramda'
import rawParser from 'yargs-parser'
import { cosmiconfig } from 'cosmiconfig'
import { Future } from 'fluture'

import pkg from '../package.json'
import etrace from './trace'

/* Config = {
 *   exclude   :: List String
 *   size      :: Integer
 *   files     :: String
 *   lines     :: Integer
 *   threshold :: Float
 * }
 */

// config :: () -> Config
export const config = () =>
  pipe(
    // grab config based on package name
    cosmiconfig,
    etrace.info('config'),
    x =>
      // we're creating a Future here to model asynchrony
      new Future((bad, good) => {
        // but the library we're using for config is using Promises
        x.search()
          // handle the bad
          .catch(bad)
          // handle the good
          .then(
            pipe(
              etrace.debug('raw config'),
              // grab config
              propOr([], 'config'),
              // config is a list of single {key: value}s
              reduce(mergeRight, {}),
              good
            )
          )
        // Future definition mandates that you return a cleanup function
        // if we have more might-fail asynchrony in the future
        // this is a good place to handle it
        return () => {}
      })
  )(pkg.name)

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

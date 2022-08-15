import kleur from 'kleur'
import {
  __ as $,
  append,
  curry,
  curryN,
  defaultTo,
  either,
  equals,
  find,
  fromPairs,
  head,
  includes,
  last,
  map,
  mergeRight,
  pipe,
  propOr,
  reduce,
  reject,
  toPairs,
} from 'ramda'
import rawParser from 'yargs-parser'
import { cosmiconfig } from 'cosmiconfig'
import { Future } from 'fluture'

import pkg from '../package.json'
import { detail as __detail, info as __info } from './trace'
import { yargsConfig, ASCII_TEXT, HELP_TEXT, HELP_STRINGS } from './constants'

/* Config = {
 *   exclude   :: List String,
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
              __detail('raw config'),
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

// wrap raw yargs-parser with curry
export const argsParser = curryN(2, rawParser)

// partially apply for default case
export const parse = argsParser($, yargsConfig)

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

const getHelpString = long => propOr('????', long, HELP_STRINGS)

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

// get a structured [preferred, alias] list from a given yargsConfig
// getAliasPairs :: YargsConfig -> List #[String, String]
export const getAliasPairs = pipe(
  // grab alias or {}
  propOr({}, 'alias'),
  // conver to pairs
  toPairs,
  // since the short flags are array-wrapped, flatten that for ease of consumption
  map(([k, [v]]) => [k, v])
)

// get just the short flags
// getShortAliases :: YargsConfig -> List String
export const getShortAliases = pipe(getAliasPairs, map(last))

// getFullAlias :: YargsConfig -> String -> [String, [String]]
export const getFullAlias = curry((yc, k) =>
  pipe(
    getAliasPairs,
    // look for k in [k, [k]]
    find(either(pipe(head, equals(k)), pipe(last, includes(k)))),
    // find can fail, so provide a default
    defaultTo([k])
  )(yc)
)

// getAlias :: YargsConfig -> String -> String
export const getAlias = curry((yc, k) => pipe(getFullAlias(yc), head)(k))

// stripShortAliases :: YargsConfig -> Config -> Config
export const stripShortAliases = curry((yc, raw) => {
  return pipe(
    // get all the short flags
    getShortAliases,
    // add the floating _ key
    append('_'),
    __info('aliases'),
    aliases =>
      pipe(
        // obj -> [[k, v]]
        toPairs,
        // skip where v is a known short flag
        reject(pipe(head, includes($, aliases))),
        // make consumable downstream
        fromPairs
      )(raw)
  )(yc)
})

const colorize = curry((style, color, str) => (color ? style(str) : str))

const red = colorize(kleur.red)
const yellow = colorize(kleur.yellow)
const cyan = colorize(kleur.cyan)

export const generateHelpFlags = curry((yc, color) =>
  pipe(
    getAliasPairs,
    map(
      ([l, s]) => `-${red(color, s)} / --${red(color, l)} - ${getHelpString(l)}`
    ),
    flags =>
      yellow(color, ASCII_TEXT) + '\n' + HELP_TEXT + '\n' + flags.join('\n')
  )(yc)
)

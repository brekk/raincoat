import { cosmiconfig } from 'cosmiconfig'
import { Future } from 'fluture'
import { curry, pipe, map, reduce, mergeRight, propOr } from 'ramda'
import etrace from './trace'

import pkg from '../package.json'

/* Config = {
 *   exclude   :: List String
 *   size      :: Integer
 *   files     :: String
 *   lines     :: Integer
 *   threshold :: Float
 * }
 */

// getRawConfig :: String -> Config
export const getRawConfig = pipe(
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
)

// a nullary function is prolly not what we want
// but for now maps to the cosmiconfig being
// nullary also
export const config = () =>
  pipe(
    // get the raw config from cosmiconfig
    getRawConfig,
    // the config is now Future-wrapped, so we must `map` to access its value
    map(pipe(etrace.info('raw config!')))
  )(pkg.name)

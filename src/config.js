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

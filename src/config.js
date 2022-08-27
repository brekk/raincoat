import { mergeRight, pipe, propOr, reduce } from 'ramda'
import { cosmiconfig } from 'cosmiconfig'
import { Future } from 'fluture'

import pkg from '../package.json'
import { detail as __detail, info as __info } from './trace'

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

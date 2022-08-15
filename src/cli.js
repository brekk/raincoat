import {
  ifElse,
  always as K,
  cond,
  concat,
  map,
  mergeRight,
  pipe,
  reduce,
  prop,
  propOr,
  slice,
  length,
  lt,
  toPairs,
  chain,
} from 'ramda'
import { resolve, parallel, reject } from 'fluture'

import {
  config,
  parse,
  stripShortAliases,
  generateHelpFlags,
  getAlias,
} from './config'
import { yargsConfig } from './constants'
import { detail as __detail } from './trace'
import { glob } from './glob'
import { red } from './color'

import { verifyConfig } from './config-yargs'

export const getInferredConfig = pipe(
  // process.argv.slice(2)
  slice(2, Infinity),
  // cli argument parser
  parse,
  // we're starting a sub function so that we can capture
  // cliConf as a named variable
  cliConf =>
    // the cosmiconfig wrapper returns a Future,
    // so we must map to access its inner value
    map(conf =>
      pipe(
        __detail('cli config'),
        // convert things to [key, value] pairs
        toPairs,
        // jam together the cosmiconfig derived values
        concat(pipe(__detail('cosmiconfig'), toPairs)(conf)),
        // make sure that we're using the expanded flags
        map(([key, value]) => [getAlias(yargsConfig, key), value]),
        // have the cli configuration overwrite the cosmiconfig
        reduce(
          (agg, [k, v]) =>
            mergeRight(agg, {
              [k]: v,
            }),
          cliConf
        ),
        // yargs-parser normalizes flags, so throw away the extraneous data
        stripShortAliases(yargsConfig),
        __detail('inferred final config')
      )(cliConf)
    )(config())
)
const hasFiles = pipe(propOr([], 'files'), length, lt(0))

const processFiles = conf =>
  pipe(
    prop('files'),
    map(glob),
    __detail('globbed?'),
    parallel(50),
    map(__detail('data'))
  )(conf)

// cli :: Config -> Future Error String
export const cli = conf => {
  const verify = verifyConfig(yargsConfig)
  return pipe(
    // figure out the inferred config
    getInferredConfig,
    // based on what that is, do stuff
    // we chain because we want to be able to fail out
    chain(cc =>
      ifElse(
        // verify that the check has no matched keys
        pipe(verify, length, lt(0)),
        // if so
        pipe(
          verify,
          // convert the unmatched keys to an error
          k =>
            new Error(
              `Unable to understand usage of the ${k
                .map(l => `"${red(cc.color, l)}"`)
                .join(', ')} flag${k.length > 1 ? 's' : ''}`
            ),
          // and reject / "throw" in future terms
          reject
        ),
        // if verify passed
        pipe(
          // check the utility of cond!
          // it takes [[whenX, doX]] functions
          // where whenX is a unary predicate
          // and doX is a unary transformer
          cond([
            // if we have some files, process them
            [hasFiles, processFiles],
            // in every other case, render help text
            [K(true), c => generateHelpFlags(yargsConfig, c.color)],
          ]),
          resolve
        )
      )(cc)
    ),
    map(__detail('HUHHHH'))
  )(conf)
}

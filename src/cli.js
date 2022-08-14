import {
  always as K,
  cond,
  concat,
  map,
  mergeRight,
  pipe,
  reduce,
  slice,
  toPairs,
} from 'ramda'

import {
  config,
  parse,
  stripShortAliases,
  generateHelpFlags,
  getAlias,
} from './config'
import { detail as __detail } from './trace'
import { yargsConfig } from './constants'

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

// cli :: Config -> Future Error String
export const cli = pipe(
  // figure out the inferred config
  getInferredConfig,
  // based on what that is, do stuff
  map(conf =>
    cond([
      // in every other case, render help text
      [K(true), c => generateHelpFlags(yargsConfig, c.color)],
    ])(conf)
  )
)

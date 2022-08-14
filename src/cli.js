import { concat, map, mergeRight, pipe, reduce, slice, toPairs } from 'ramda'

import {
  config,
  parse,
  yargsConfig,
  stripShortAliases,
  getAlias,
} from './config'
import { detail as __detail } from './trace'

// cli :: Config -> Future Error String
export const cli = pipe(slice(2, Infinity), parse, cliConf =>
  map(conf =>
    pipe(
      __detail('cli config'),
      toPairs,
      concat(pipe(__detail('cosmiconfig'), toPairs)(conf)),
      map(([key, value]) => [getAlias(yargsConfig, key), value]),
      reduce(
        (agg, [k, v]) =>
          mergeRight(agg, {
            [k]: v,
          }),
        cliConf
      ),
      __detail('pre final'),
      stripShortAliases(yargsConfig),
      __detail('final config')
    )(cliConf)
  )(config())
)

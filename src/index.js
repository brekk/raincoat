import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'path'

import glob from 'fast-glob'
import { fork } from 'fluture'
import kleur from 'kleur'
import { concat, map, mergeRight, pipe, reduce, slice, toPairs } from 'ramda'

import { config, parse, yargsConfig, getAlias } from './config'
import { detail as __detail } from './trace'

// cli :: Config -> Future Error String
const cli = pipe(slice(2, Infinity), parse, cliConf =>
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
      __detail('final config')
    )(cliConf)
  )(config())
)

fork(console.warn)(console.log)(cli(process.argv))

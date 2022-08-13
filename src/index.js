import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'path'

import glob from 'fast-glob'
import { fork } from 'fluture'
import kleur from 'kleur'
import {
  nth,
  unless,
  uniq,
  __ as $,
  always as K,
  all,
  complement,
  isEmpty,
  apply,
  both,
  chain,
  concat,
  curryN,
  curry,
  is,
  ifElse,
  pipe,
  map,
  mergeRight,
  reduce,
  slice,
  toPairs,
  find,
  head,
  equals,
  last,
  propOr,
  type,
  when,
  cond,
  defaultTo,
  any,
  either,
  includes,
} from 'ramda'
import yargsParser from 'yargs-parser'

import { config } from './config'
import itrace from './trace'
import { yargsConfig, getAlias } from './runtime'

/*
const firstTypeIs = curry((expected, x) =>
  pipe(head, type, equals(expected))(x)
)

const tupleTypeSame = pipe(map(type), apply(equals))

const smoosh = curry((a, b) =>
  ifElse(
    both(tupleTypeSame, complement(all(isEmpty))),
    pipe(
      cond([
        [firstTypeIs('Array'), pipe(apply(concat), uniq)],
        [firstTypeIs('Object'), apply(mergeRight)],
        [K(true), K(b)],
      ])
    ),
    K(b)
  )([a, b])
)

const mergeAll = curry((a, b) =>
  ifElse(
    both(tupleTypeSame, pipe(head, type, equals('Object'))),
    ([a2, b2]) =>
      pipe(
        toPairs,
        reduce(
          (x, [k, v]) => pipe(mergeRight(x), smoosh(a2[k] || false))(v),
          b2
        )
      )(a2),
    apply(smoosh)
  )([a, b])
)
*/

pipe(
  slice(2, Infinity),
  curryN(2, yargsParser)($, yargsConfig),
  cli =>
    map(conf =>
      pipe(
        toPairs,
        concat(toPairs(conf)),
        map(([key, value]) => [getAlias(yargsConfig, key), value]),
        reduce(
          (agg, [k, v]) =>
            mergeRight(agg, {
              [k]: v,
            }),
          cli
        )
      )(cli)
    )(config()),
  fork(console.warn)(console.log)
)(process.argv)

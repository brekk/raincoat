import { curryN, __ as $ } from 'ramda'
import rawParser from 'yargs-parser'

// .atacamarc
//
// - exclude:
//   - node_modules/**
//   - build/**
// - size: 100
// - files: "**/*.*"
// - lines: 4
// - threshold: 95

export const yargsConfig = {
  alias: {
    exclude: ['x'],
    size: ['s'],
    files: ['i'],
    lines: ['l'],
    threshold: ['t'],
  },
  array: ['x'],
  number: ['s', 'l', 't'],
}

// wrap raw yargs-parser with curry
export const argsParser = curryN(2, rawParser)

// partially apply for default case
export const parse = argsParser($, yargsConfig)

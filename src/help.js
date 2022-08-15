import { curry, map, propOr, pipe } from 'ramda'

import { getAliasPairs } from './config-yargs'
import { red, yellow } from './color'

import { HELP_STRINGS, ASCII_TEXT, HELP_TEXT } from './constants'

const getHelpString = long => propOr('????', long, HELP_STRINGS)

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

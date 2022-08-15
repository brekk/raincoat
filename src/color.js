import kleur from 'kleur'
import { curry } from 'ramda'

export const colorize = curry((style, color, str) => (color ? style(str) : str))

export const red = colorize(kleur.red)
export const yellow = colorize(kleur.yellow)

// const cyan = colorize(kleur.cyan)

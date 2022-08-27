import { split, addIndex, map as _map, pipe } from 'ramda'
import Unusual from 'unusual'
import { call } from 'xtrace'
import pkg from '../package.json'

import {
  of,
  size,
  clear,
  remove,
  forEach,
  get,
  has,
  set,
  map,
  toEntries,
  toKeys,
  toValues,
} from './map'

const u = Unusual(pkg.name + pkg.version)

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

const alphabetPairs = pipe(
  split(''),
  addIndex(_map)((x, idx) => [x, idx + 1])
)(ALPHABET)

const FIXTURE = () => of(alphabetPairs)

test('Map - size', () => {
  pipe(size, x => expect(x).toEqual(ALPHABET.length))(FIXTURE())
})

test('Map - clear', () => {
  pipe(call(clear), size, x => expect(x).toEqual(0))(FIXTURE())
})
test('Map - remove', () => {
  pipe(call(remove('a')), call(remove('z')), size, x =>
    expect(x).toEqual(alphabetPairs.length - 2)
  )(FIXTURE())
})
test('Map - forEach', () => {
  const ref = []
  pipe(
    forEach((v, k) => {
      if (~v % 2) ref.push(k)
    }),
    () => expect(ref).toEqual('bdfhjlnprtvxz'.split(''))
  )(FIXTURE())
})
test('Map - get', () => {
  pipe(get('n'), x => expect(x).toEqual(14))(FIXTURE())
})
test('Map - has', () => {
  pipe(has('k'), x => expect(x).toBeTruthy())(FIXTURE())
})
test('Map - !has', () => {
  pipe(has('zipple'), x => expect(x).toBeFalsy())(FIXTURE())
})
test('Map - set', () => {
  const value = u.integer({ min: 0, max: 100 })
  pipe(call(set('p', value)), get('p'), y => expect(y).toEqual(value))(
    FIXTURE()
  )
})
test('Map - map', () => {
  pipe(
    map(([k, v]) => [v * 2, k]),
    output =>
      expect(output).toEqual([
        [2, 'a'],
        [4, 'b'],
        [6, 'c'],
        [8, 'd'],
        [10, 'e'],
        [12, 'f'],
        [14, 'g'],
        [16, 'h'],
        [18, 'i'],
        [20, 'j'],
        [22, 'k'],
        [24, 'l'],
        [26, 'm'],
        [28, 'n'],
        [30, 'o'],
        [32, 'p'],
        [34, 'q'],
        [36, 'r'],
        [38, 's'],
        [40, 't'],
        [42, 'u'],
        [44, 'v'],
        [46, 'w'],
        [48, 'x'],
        [50, 'y'],
        [52, 'z'],
      ])
  )(FIXTURE())
})

test('Map - toEntries', () => {
  pipe(
    toEntries,
    x => {
      const out = []
      for (const [k, v] of x) {
        if (v % 3 === 0) {
          out.push(k)
        }
      }
      return out
    },
    y => expect(y).toEqual('cfilorux'.split(''))
  )(FIXTURE())
})

test('Map - toKeys', () => {
  pipe(
    toKeys,
    x => {
      const out = []
      let v = 1
      for (const k of x) {
        if (v % 3 === 0) {
          out.push(k)
        }
        v += 1
      }
      return out
    },
    y => expect(y).toEqual('cfilorux'.split(''))
  )(FIXTURE())
})

test('Map - toValues', () => {
  pipe(
    toValues,
    x => {
      const out = []
      for (const v of x) {
        if (v % 4 === 0) {
          out.push(v)
        }
      }
      return out
    },
    y => expect(y).toEqual([4, 8, 12, 16, 20, 24])
  )(FIXTURE())
})

import {
  ap,
  curryN,
  defaultTo,
  equals,
  ifElse,
  includes,
  init,
  length,
  of,
  pipe,
  last,
  unless,
  join,
} from 'ramda'

export const box = unless(Array.isArray, of)

export const summarize = docs =>
  pipe(
    ifElse(
      pipe(length, equals(2)),
      join(' and '),
      pipe(of, ap([init, last]), ([a, z]) => `${join(', ', a)} and ${z}`)
    )
  )(docs)

export const makeMessage = curryN(4, (docs, type, hashes, content) =>
  pipe(state => {
    const addDoc = d =>
      unless(
        () => includes(d, state.docs),
        () => {
          state.docs.push(d)
        }
      )(state.docs)
    const hasDoc = x => includes(x, state.docs)
    const sum = () => summarize(state.docs)
    return { addDoc, hasDoc, summarize: sum }
  })({
    docs,
    type,
    hashes: box(hashes),
    content: pipe(defaultTo(''), box)(content),
  })
)

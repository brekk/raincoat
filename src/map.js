import { prop, curryN } from 'ramda'
// tacit maps

export const of = x => new Map(x)
export const size = prop('size')
export const clear = x => x.clear()
export const remove = curryN(2, (e, x) => x.delete(e))
export const forEach = curryN(2, (fn, x) => x.forEach(fn))
export const get = curryN(2, (e, x) => x.get(e))
export const has = curryN(2, (e, x) => x.has(e))
export const set = curryN(3, (k, v, x) => x.set(k, v))

export const map = curryN(2, (fn, x) => {
  const agg = []
  for (const [k, v] of x) {
    agg.push(fn([k, v]))
  }
  return agg
})

// these return _iterators_
export const toEntries = x => x.entries()
export const toKeys = x => x.keys()
export const toValues = x => x.values()

import F from 'fluture'
import fg from 'fast-glob'
import { curryN } from 'ramda'

export const globWithConfig = curryN(
  2,
  (conf, g) =>
    new F((bad, good) => {
      fg(g, conf).catch(bad).then(good)
      return () => {}
    })
)
export const glob = globWithConfig({})

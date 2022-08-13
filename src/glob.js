import F from 'fluture'
import fg from 'fast-glob'
import { curryN } from 'ramda'

export const readDirWithConfig = curryN(
  2,
  (conf, glob) =>
    new F((bad, good) => {
      fg(glob, conf).catch(bad).then(good)
      return () => {}
    })
)
export const readDir = readDirWithConfig({})

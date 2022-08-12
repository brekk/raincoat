import F from 'fluture'
import fg from 'fast-glob'

export const readDirWithConfig = curry(
  (conf, glob) =>
    new F((bad, good) => {
      fg(glob, conf).catch(bad).then(good)
      return CANCEL
    })
)
export const readDir = readDirWithConfig({})

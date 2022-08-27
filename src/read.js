import { readFile as readFileRaw } from 'node:fs'
import { curryN } from 'ramda'
import { Future } from 'fluture'

export const readFileWithOptions = curryN(2, (options, path) =>
  Future((reject, resolve) => {
    readFileRaw(path, options, (e, data) => (e ? reject(e) : resolve(data)))
    return () => {}
  })
)

export const readFile = readFileWithOptions({
  encoding: 'utf8',
})

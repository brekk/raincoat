import path from 'node:path'
import { fork } from 'fluture'

import { globWithConfig } from './glob'

const local = x => path.relative('.', x)

test('globWithConfig', done => {
  const f = globWithConfig(
    {
      ignore: ['node_modules/*'],
    },
    path.resolve(__dirname, '../fixture/*.md')
  )
  fork(done)(e => {
    const output = e.map(local)
    expect(output).toEqual(['fixture/poem1.md', 'fixture/poem2.md'])
    done()
  })(f)
})

import path from 'node:path'
import { fork } from 'fluture'

import { globWithConfig } from './glob'

test('globWithConfig', done => {
  const f = globWithConfig(path.resolve(__dirname, '../fixture/*.md'), {
    ignore: ['node_modules/*'],
  })
  fork(done)(e => {
    console.log(e)
    done()
  })(f)
})

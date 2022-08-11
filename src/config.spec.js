import { pipe } from 'ramda'
import { fork } from 'fluture'

import { getRawConfig } from './config'
import pkg from '../package.json'

test('loads the default `.atacamarc` file', done => {
  pipe(
    getRawConfig,
    fork(done)(raw => {
      expect(raw).toEqual({
        exclude: ['node_modules/**', 'build/**'],
        size: 100,
        files: '**/*.*',
        lines: 4,
        threshold: 95,
      })
      done()
    })
  )(pkg.name)
})

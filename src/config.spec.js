import { pipe } from 'ramda'
import { fork } from 'fluture'

import pkg from '../package.json'
import { config } from './config'

test(`loads the default '.${pkg.name}rc' file`, done => {
  pipe(
    config,
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

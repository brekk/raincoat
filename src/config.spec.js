import pkg from '../package.json'

import { pipe } from 'ramda'
import { fork } from 'fluture'

import { getRawConfig } from './config'

test(`loads the default '.${pkg.name}rc' file`, done => {
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

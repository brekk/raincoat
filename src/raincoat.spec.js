import { runTest, expectToBe } from 'quizzically'
import { prop, pipe } from 'ramda'

console.log({ runTest, expectToBe })

import itrace from './trace'

const hurl = e => {
  throw e
}

describe('raincoat cli', () => {
  it('overrides aliases', () =>
    runTest(
      {
        cmd: `./raincoat.js`,
        transformer: prop('stdout'),
        expect,
        args: ['-x', '"shit/**"'],
      },
      hurl,
      pipe(itrace.info('huh')),
      ''
    ))
})

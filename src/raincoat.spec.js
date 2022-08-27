import { runTest } from 'quizzically'
import { curryN, prop, identity as I } from 'ramda'

// import itrace from './trace'

const hurl = e => {
  throw e
}

// const j2 = x => JSON.stringify(x, null, 2)
const j = JSON.stringify

// const expectWillBe = fn => curryN(3, (e, b, a) => e(fn(a)).toEqual(b))

const runWithArgs = curryN(2, (args, expected) =>
  runTest(
    {
      cmd: `./raincoat.js`,
      // transformer: pipe(prop('stdout'), JSON.parse),
      transformer: prop('stdout'),
      expect,
      // expectation: expectWillBe(j),
      args,
    },
    hurl,
    I,
    expected
  )
)

describe('raincoat cli', () => {
  it('pulls raw .raincoatrc', () =>
    runWithArgs(
      [],
      j({
        exclude: ['node_modules/**', 'build/**', 'coverage/**'],
        size: 100,
        files: '**/*.*',
        lines: 4,
        threshold: 95,
      })
    ))
  it('overrides aliases', () =>
    runWithArgs(
      ['-x', 'bad/**'],
      j({
        exclude: ['bad/**'],
        size: 100,
        files: '**/*.*',
        lines: 4,
        threshold: 95,
      })
    ))
})

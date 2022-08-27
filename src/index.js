import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import glob from 'fast-glob'
import { fork } from 'fluture'
import kleur from 'kleur'
import { when, is, pipe } from 'ramda'

import { cli } from './cli'
pipe(
  fork(
    // cant' go tacit with .write
    pipe(
      when(
        e => e instanceof Error,
        x => x.toString()
      ),
      x => {
        process.stderr.write(x)
        process.exit(1)
      }
    )
  )(
    // same
    // x => process.stdout.write(JSON.stringify(x))
    x => {
      console.log(x)
      // process.stdout.write(x)
      process.exit(0)
    }
  )
)(cli(process.argv))

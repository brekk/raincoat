import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import glob from 'fast-glob'
import { fork } from 'fluture'
import kleur from 'kleur'
import { pipe } from 'ramda'

import { cli } from './cli'
pipe(
  fork(
    // cant' go tacit with .write
    x => process.stderr.write(x)
  )(
    // same
    // x => process.stdout.write(JSON.stringify(x))
    x => process.stdout.write(x)
  )
)(cli(process.argv))

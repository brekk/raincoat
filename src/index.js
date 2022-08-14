import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'path'

import glob from 'fast-glob'
import { fork } from 'fluture'
import kleur from 'kleur'

import { cli } from './cli'

fork(x => process.stderr.write(x))(x =>
  process.stdout.write(JSON.stringify(x))
)(cli(process.argv))

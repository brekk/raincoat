import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'path'

import kleur from 'kleur'
import glob from 'fast-glob'
import { fork } from 'fluture'
import { curry, pipe, slice } from 'ramda'

import { config } from './config'

pipe(config, chain(pipe()), fork(console.warn)(console.log))()

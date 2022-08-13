import { complextrace } from 'envtrace'
import pkg from '../package.json'

export const trace = complextrace(pkg.name, ['info', 'warn', 'error', 'debug'])

export default trace

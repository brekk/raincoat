import { complextrace } from 'envtrace'
import pkg from '../package.json'

export const trace = complextrace(pkg.name, ['info', 'detail', 'debug'])
export default trace

export const info = trace.info
export const detail = trace.detail
export const debug = trace.debug

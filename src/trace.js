import { complextrace } from 'envtrace'
import pkg from '../package.json'

export const trace = complextrace(pkg.name, ['info', 'detail', 'debug'])
export default trace

export const { info, detail, debug } = trace

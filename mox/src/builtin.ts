import { performance } from 'perf_hooks'

import * as object from './object'

const clock = new object.Builtin(() => new object.Int(performance.now()))

export default new Map<string, object.Builtin>([['clock', clock]])

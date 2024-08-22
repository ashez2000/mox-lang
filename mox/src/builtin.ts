import * as object from './object'

const clock = new object.Builtin(() => new object.Int(new Date().getMilliseconds()))

export default new Map<string, object.Builtin>([['clock', clock]])

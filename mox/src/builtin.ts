import * as object from './object.js'

const clock = new object.Builtin(() => new object.Int(performance.now()))

const len = new object.Builtin((...args: any[]) => {
  if (args.length != 1) {
    return new object.Error('wrong number of arguments')
  }

  const t = args[0]

  if (t instanceof object.String) {
    return new object.Int(t.value.length)
  }

  if (t instanceof object.Array) {
    return new object.Int(t.elements.length)
  }

  return new object.Error('len not supported for type ' + t.type)
})

export default new Map<string, object.Builtin>([
  ['clock', clock],
  ['len', len],
])

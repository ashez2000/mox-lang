import { evaluate } from 'mox'

export default function run(input: string) {
  let r = evaluate(input)
  return { output: r.stdout, errors: r.errors }
}

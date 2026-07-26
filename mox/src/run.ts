import fs from 'node:fs'

import { evaluate } from './lib.js'

export default function run(path: string) {
  let input = fs.readFileSync(path, 'utf-8')
  let result = evaluate(input)

  for (let o of result.stdout) {
    console.log(o)
  }

  for (let e of result.errors) {
    console.log(e)
  }
}

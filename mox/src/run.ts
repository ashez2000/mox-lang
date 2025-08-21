import fs from 'node:fs'

import { buildLexer } from './lexer.js'
import { Parser } from './parser.js'
import { Interpreter } from './interpreter.js'

export default function run(path: string) {
  const input = fs.readFileSync(path, 'utf-8')

  const { tokenIter, errors } = buildLexer(input)
  if (errors.length !== 0) {
    for (const e of errors) {
      console.error(e)
    }
    return
  }

  const parser = new Parser(tokenIter)
  const program = parser.parse()
  for (const e of parser.errors) {
    console.error(e)
  }

  const interpreter = new Interpreter()
  interpreter.interpret(program)
  for (let o of interpreter.stdout) {
    console.log(o)
  }
}

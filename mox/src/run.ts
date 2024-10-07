import fs from 'node:fs'

import { Lexer } from './lexer'
import { Parser } from './parser'
import { Interpreter } from './interpreter'

export default function run(path: string) {
  const input = fs.readFileSync(path, 'utf-8')

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)

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

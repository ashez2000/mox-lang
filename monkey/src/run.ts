import { Lexer } from './lexer'
import { Parser } from './parser'
import { Interpreter } from './interpreter'

export default function run(input: string) {
  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const errors = []

  const stmts = parser.parse()
  for (const e of parser.errors) {
    errors.push(e)
  }

  const interpreter = new Interpreter()
  const result = interpreter.evaluate(stmts)
  return { result, errors }
}

import { Interpreter } from './interpreter.js'
import { Lexer } from './lexer.js'
import { Parser } from './parser.js'

// TODO: Improve result type
// - Add stats
export type EvalResult = {
  stdout: string[]
  errors: string[]
}

export function evaluate(input: string): EvalResult {
  const errors: string[] = []

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const program = parser.parse()

  for (const e of parser.errors) {
    errors.push(e)
  }

  const interpreter = new Interpreter()

  // TODO: Add runtime error to errors
  interpreter.interpret(program)

  return { stdout: interpreter.stdout, errors }
}

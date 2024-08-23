import { Lexer, Parser, Interpreter } from 'mox'

export default function run(input: string) {
  const output: string[] = []
  const errors: string[] = []

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const program = parser.parse()
  for (const e of parser.errors) {
    errors.push(e)
  }

  const interpreter = new Interpreter((value) => output.push(value))
  interpreter.interpret(program)

  return { output, errors }
}

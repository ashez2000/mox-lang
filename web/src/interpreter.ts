import { Lexer, Parser, Interpreter } from 'mox'

export default function run(input: string): string {
  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const program = parser.parse()

  const interpreter = new Interpreter()
  const result = interpreter.interpret(program)

  return result.toString()
}

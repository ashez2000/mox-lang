import readline from 'node:readline'
import { Lexer } from './lexer'
import { Parser } from './parser'
import { Interpreter } from './interpreter'

function prompt(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question('> ', (input) => {
      rl.close()
      resolve(input)
    })
  })
}

export default async function repl() {
  const interpreter = new Interpreter()

  while (true) {
    const input = await prompt()
    const lexer = Lexer.new(input)
    const parser = Parser.new(lexer)
    const program = parser.parse()

    if (parser.errors.length) {
      for (const e of parser.errors) {
        console.log(e)
      }
      continue
    }

    const result = interpreter.interpret(program)
    console.log(result.toString())
  }
}

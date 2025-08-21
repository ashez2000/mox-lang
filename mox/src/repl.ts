import readline from 'node:readline'
import { buildLexer } from './lexer.js'
import { Parser } from './parser.js'
import { Interpreter } from './interpreter.js'

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

    const { tokenIter, errors } = buildLexer(input)
    if (errors.length !== 0) {
      for (const e of errors) {
        console.error(e)
      }
      continue
    }

    const parser = new Parser(tokenIter)
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

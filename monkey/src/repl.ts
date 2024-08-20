import readline from 'node:readline'

import { Lexer } from './lexer'
import { Parser } from './parser'
import astPrinter from './ast-printer'

function prompt(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question('>> ', (input) => {
      rl.close()
      resolve(input)
    })
  })
}

export async function repl() {
  while (true) {
    const input = await prompt()
    const lexer = Lexer.new(input)
    const parser = Parser.new(lexer)

    const stmts = parser.parse()
    if (parser.errors.length) {
      for (const e of parser.errors) {
        console.log(e)
      }
      continue
    }

    for (const s of stmts) {
      console.log(astPrinter.print(s))
    }
  }
}

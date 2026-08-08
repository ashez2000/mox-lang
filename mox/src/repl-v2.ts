import readline from 'node:readline'

import { Lexer } from './lexer-v2.js'
import { Parser } from './parser-v2.js'

function prompt(): Promise<string> {
  let rl = readline.createInterface({
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
  while (true) {
    let input = await prompt()
    let lexer = new Lexer(input)
    let tokens = lexer.scanTokens()
    if (lexer.errors.length != 0) {
      for (let e of lexer.errors) {
        console.log(e)
      }
      continue
    }

    let parser = new Parser(tokens)
    let statements = parser.parse()
    if (parser.errors.length != 0) {
      for (let e of parser.errors) {
        console.log(e)
      }
      continue
    }

    for (let s of statements) {
      console.log(JSON.stringify(s))
    }
  }
}

repl()

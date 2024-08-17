import readline from 'node:readline'
import { Lexer } from './lexer'
import { TokenType } from './token'

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

    for (
      let tok = lexer.nextToken();
      tok.type !== TokenType.EOF;
      tok = lexer.nextToken()
    ) {
      console.log(tok)
    }
  }
}

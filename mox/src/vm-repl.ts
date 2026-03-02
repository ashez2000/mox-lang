import readline from 'node:readline'
import { buildLexer } from './lexer.js'
import { Parser } from './parser.js'
import { Complier } from './compiler.js'
import { Vm } from './vm.js'

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
    console.log(JSON.stringify(program.statements))

    const compiler = new Complier()
    compiler.compile(program)
    console.log(compiler.instructions)
    const vm = new Vm(compiler.instructions)
    vm.run()
    console.log(vm.top())
  }
}

repl()

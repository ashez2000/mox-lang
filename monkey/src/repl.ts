import readline from 'node:readline'
import run from './run'

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
    const { result, errors } = run(input)

    if (errors.length) {
      for (const e of errors) {
        console.log(e)
      }
      continue
    }

    for (const r of result) {
      console.log(r.display())
    }
  }
}

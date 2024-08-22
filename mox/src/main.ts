import repl from './repl.js'
import run from './run.js'

const inputPath = process.argv[2]

if (inputPath) {
  run(inputPath)
} else {
  console.log('Welcome to mox-lang v0.1.0')
  repl()
}

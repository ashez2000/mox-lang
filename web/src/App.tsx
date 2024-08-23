import { useState } from 'react'
import run from './interpreter'

const example = `\
let fib = fn (n) {
    if (n < 2) { return n; };
    return fib(n - 1) + fib(n - 2);
}

print fib(6);
`

export default function App() {
  const [input, setInput] = useState(example)
  const [output, setOutput] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const evaluate = () => {
    const result = run(input)
    setOutput(result.output)
    setErrors(result.errors)
  }

  return (
    <main className="max-w-7xl mx-auto p-3 font-mono">
      <header className="mb-3">
        <h1 className="text-4xl">Mox Lang v0.1.0</h1>
      </header>

      <div className="mb-3">
        <button className="px-3 py-2 bg-zinc-200" onClick={evaluate}>
          Evaluate
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <textarea
          className="p-3 border border-zinc-800 rounded outline-none"
          style={{ height: '80vh' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="p-3 border border-zinc-400 rounded">
          <div>
            {errors.map((e) => (
              <div className="text-red-600">{e}</div>
            ))}
          </div>
          <div>
            {output.map((e) => (
              <div>{e}</div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

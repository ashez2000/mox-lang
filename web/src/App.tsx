import { useState } from 'react'
import run from './interpreter'

export default function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  const evaluate = () => {
    setResult(run(input))
  }

  return (
    <main className="max-w-7xl mx-auto px-3">
      <header>
        <h1 className="text-4xl">Mox Lang v0.1.0</h1>
      </header>
      <div>
        <button onClick={evaluate}>Evaluate</button>
      </div>
      <div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} />
        <div>{result}</div>
      </div>
    </main>
  )
}

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { evaluate } from 'mox'

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

  const evaluateInput = () => {
    let r = evaluate(input)
    setOutput(r.stdout)
    setErrors(r.errors)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Mox Lang</h1>
            <p className="text-zinc-400 mt-1">Toy Programming Language Playground</p>
          </div>

          <span className="px-3 py-1 text-sm rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
            v0.1.0
          </span>
        </header>

        <div className="mb-4">
          <button
            onClick={evaluateInput}
            className="
              px-5 py-2.5
              rounded-lg
              bg-emerald-600
              hover:bg-emerald-500
              active:scale-[0.98]
              transition
              font-medium
              shadow-lg shadow-emerald-900/30
            "
          >
            ▶ Run Program
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Editor */}
          <section className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
              <h2 className="font-semibold text-zinc-200">Source Code</h2>
            </div>

            <Editor
              height="80vh"
              defaultLanguage="plaintext"
              theme="vs-dark"
              value={input}
              onChange={(value) => setInput(value ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'off',
                tabSize: 4,
                insertSpaces: true,
                padding: {
                  top: 16,
                  bottom: 16,
                },
                renderWhitespace: 'selection',
                smoothScrolling: true,
                bracketPairColorization: {
                  enabled: true,
                },
              }}
            />
          </section>

          {/* Output */}
          <section className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-200">Output</h2>

              {errors.length > 0 ? (
                <span className="text-xs px-2 py-1 rounded bg-red-950 text-red-400 border border-red-800">
                  {errors.length} error(s)
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Success
                </span>
              )}
            </div>

            <div className="h-[80vh] overflow-auto p-4 font-mono text-sm">
              {errors.length > 0 && (
                <div className="mb-6">
                  <div className="text-red-400 font-semibold mb-2">Errors</div>

                  <div className="space-y-2">
                    {errors.map((err, i) => (
                      <div
                        key={i}
                        className="
                          p-3
                          rounded-lg
                          border
                          border-red-900
                          bg-red-950/40
                          text-red-300
                        "
                      >
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-zinc-400 font-semibold mb-2">Console</div>

                {output.length === 0 && errors.length === 0 ? (
                  <div className="text-zinc-500 italic">Run the program to see output...</div>
                ) : (
                  <div className="space-y-1">
                    {output.map((line, i) => (
                      <div key={i} className="text-zinc-200">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

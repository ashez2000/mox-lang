import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Int, MonkeyObject } from '../object'
import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { Interpreter } from '../interpreter'

test('test int eval', () => {
  const result = testEval('10')
  assert.equal(result.length, 1)
  console.log(result[0])
  testIntObject(result[0], 10)
})

//
// test utils
//

function testEval(input: string) {
  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const stmts = parser.parse()
  const interpreter = new Interpreter()
  return interpreter.evaluate(stmts)
}

function testIntObject(object: MonkeyObject, value: number) {
  assert(object instanceof Int)
  assert.equal(object.value, value)
}

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Int, MonkeyObject } from '../object'
import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { Interpreter } from '../interpreter'
import { Bool } from '../object'

test('test int eval', () => {
  const result = testEval('10')
  assert.equal(result.length, 1)
  testIntObject(result[0], 10)
})

test('test bool eval', () => {
  let result = testEval('true')
  assert.equal(result.length, 1)
  testBoolObject(result[0], true)

  result = testEval('false')
  assert.equal(result.length, 1)
  testBoolObject(result[0], false)
})

test('test bang eval', () => {
  const tests: [string, boolean][] = [
    ['!true', false],
    ['!false', true],
    ['!5', false],
    ['!!true', true],
    ['!!false', false],
    ['!!5', true],
  ]

  for (const t of tests) {
    const result = testEval(t[0])
    testBoolObject(result[0], t[1])
  }
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

function testBoolObject(object: MonkeyObject, value: boolean) {
  assert(object instanceof Bool)
  assert.equal(object.value, value)
}

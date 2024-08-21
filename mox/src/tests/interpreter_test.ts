import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Lexer } from '../lexer'
import { Parser } from '../parser'
import { Interpreter } from '../interpreter'
import * as object from '../object'

type MoxObject = object.MoxObject

test('interpreter: test integer expression evaluation', () => {
  const tests: [string, number][] = [
    ['5', 5],
    ['10', 10],
    ['-5', -5],
    ['-10', -10],
    ['5 + 5 + 5 + 5 - 10', 10],
    ['2 * 2 * 2 * 2 * 2', 32],
    ['-50 + 100 + -50', 0],
    ['5 * 2 + 10', 20],
    ['5 + 2 * 10', 25],
    ['20 + 2 * -10', 0],
    ['50 / 2 * 2 + 10', 60],
    ['2 * (5 + 10)', 30],
    ['3 * 3 * 3 + 10', 37],
    ['3 * (3 * 3) + 10', 37],
    ['(5 + 10 * 2 + 15 / 3) * 2 + -10', 50],
  ]

  for (const t of tests) {
    const value = testEval(t[0])
    testIntObject(value, t[1])
  }
})

test('interpreter: test bool expression evalutation', () => {
  const tests: [string, boolean][] = [
    ['true', true],
    ['false', false],
    ['1 < 2', true],
    ['1 > 2', false],
    ['1 < 1', false],
    ['1 > 1', false],
    ['1 == 1', true],
    ['1 != 1', false],
    ['1 == 2', false],
    ['1 != 2', true],
  ]

  for (const t of tests) {
    const value = testEval(t[0])
    testBoolObject(value, t[1])
  }
})

test('interpreter: test bang operator evaluation', () => {
  const tests: [string, boolean][] = [
    ['!true', false],
    ['!false', true],
    ['!5', false],
    ['!!true', true],
    ['!!false', false],
    ['!!5', true],
  ]

  for (const t of tests) {
    const value = testEval(t[0])
    testBoolObject(value, t[1])
  }
})

//
// test utils
//

function testEval(input: string) {
  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const program = parser.parse()

  const interpreter = new Interpreter()

  return interpreter.interpret(program)
}

function testIntObject(obj: MoxObject, value: number) {
  assert(obj instanceof object.Int)
  assert.equal(obj.value, value)
}

function testBoolObject(obj: MoxObject, value: boolean) {
  assert(obj instanceof object.Bool)
  assert.equal(obj.value, value)
}

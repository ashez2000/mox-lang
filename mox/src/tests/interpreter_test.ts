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
    ['true == true', true],
    ['false == false', true],
    ['true == false', false],
    ['true != false', true],
    ['false != true', true],
    ['(1 < 2) == true', true],
    ['(1 < 2) == false', false],
    ['(1 > 2) == true', false],
    ['(1 > 2) == false', true],
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

test('interpreter: test if else expression evalutation', () => {
  const tests: [string, number | null][] = [
    ['if (true) { 10 }', 10],
    ['if (false) { 10 }', null],
    ['if (1) { 10 }', 10],
    ['if (1 < 2) { 10 }', 10],
    ['if (1 > 2) { 10 }', null],
    ['if (1 > 2) { 10 } else { 20 }', 20],
    ['if (1 < 2) { 10 } else { 20 }', 10],
    ['if (true) { if (true) { return 10; } return 1; }', 10],
  ]

  for (const t of tests) {
    const value = testEval(t[0])
    if (t[1] != null) {
      testIntObject(value, t[1])
    } else {
      testNullObject(value)
    }
  }
})

test('interpreter: test return statement execution', () => {
  const tests: [string, number][] = [
    ['return 10;', 10],
    ['return 10; 9;', 10],
    ['return 2 * 5; 9;', 10],
    ['9; return 2 * 5; 9;', 10],
  ]

  for (const t of tests) {
    const value = testEval(t[0])
    console.log(value)
    testIntObject(value, t[1])
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

function testNullObject(obj: MoxObject) {
  assert(obj instanceof object.Null)
}

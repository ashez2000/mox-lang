import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Parser } from '../parser.js'
import { Lexer } from '../lexer.js'
import { Bool, Expr, ExprStmt, Ident, IfExpr, Infix, Int, Let, Prefix, Return, Stmt } from '../ast.js'

test('test parseLetStatement', () => {
  const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `

  const expectedStatements = 3
  const statements = testProgram(input, expectedStatements)

  for (let i = 0; i < 3; i++) {
    const stmt = statements[i]
    assert(stmt instanceof Let)
  }
})

test('test parseReturnStatement', () => {
  const input = `
    return 5;
    return 10;
    return 993322;
  `

  const expectedStatements = 3
  const statements = testProgram(input, expectedStatements)

  for (let i = 0; i < 3; i++) {
    const stmt = statements[i]
    assert(stmt instanceof Return)
  }
})

test('test parseIdentifier', () => {
  const input = 'foobar;'
  const expectedStatements = 1
  const statements = testProgram(input, expectedStatements)

  const stmt = statements[0]
  assert(stmt instanceof ExprStmt)

  const ident = stmt.value
  assert(ident instanceof Ident)
  assert.equal(ident.name, 'foobar')
})

test('test parseInteger', () => {
  const input = '5;'
  const expectedStatements = 1
  const statements = testProgram(input, expectedStatements)

  const stmt = statements[0]
  assert(stmt instanceof ExprStmt)

  testIntegerExpr(stmt.value, 5)
})

test('test parseBool', () => {
  const tests = [
    { input: 'true;', value: true },
    { input: 'false;', value: false },
  ]

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i]
    const expectedStatements = 1
    const statements = testProgram(t.input, expectedStatements)

    const stmt = statements[0]
    assert(stmt instanceof ExprStmt)

    const bool = stmt.value
    assert(bool instanceof Bool)
    assert.equal(bool.value, t.value)
  }
})

test('test parsePrefixExpreesion', () => {
  const tests = [
    { input: '!15;', operator: '!', value: 15 },
    { input: '-15;', operator: '-', value: 15 },
  ]

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i]
    const expectedStatements = 1
    const statements = testProgram(t.input, expectedStatements)

    const stmt = statements[0]
    assert(stmt instanceof ExprStmt)

    const prefix = stmt.value
    assert(prefix instanceof Prefix)
    assert.equal(prefix.operator, t.operator)
    testIntegerExpr(prefix.right, t.value)
  }
})

test('test parseInfixExpression', () => {
  const tests = [
    { input: '5 + 5', operator: '+', left: 5, right: 5 },
    { input: '5 - 5', operator: '-', left: 5, right: 5 },
    { input: '5 * 5', operator: '*', left: 5, right: 5 },
    { input: '5 / 5', operator: '/', left: 5, right: 5 },
    { input: '5 < 5', operator: '<', left: 5, right: 5 },
    { input: '5 > 5', operator: '>', left: 5, right: 5 },
    { input: '5 == 5', operator: '==', left: 5, right: 5 },
    { input: '5 != 5', operator: '!=', left: 5, right: 5 },
  ]

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i]
    const expectedStatements = 1
    const statements = testProgram(t.input, expectedStatements)

    const stmt = statements[0]
    assert(stmt instanceof ExprStmt)

    const infix = stmt.value
    assert(infix instanceof Infix)

    assert.equal(infix.operator, t.operator)
    testIntegerExpr(infix.left, t.left)
    testIntegerExpr(infix.right, t.right)
  }
})

test('test parseIfExpression', () => {
  const input = 'if (x < y) { x }'
  const expectedStatements = 1
  const statements = testProgram(input, expectedStatements)

  const stmt = statements[0]
  assert(stmt instanceof ExprStmt)

  const ifExpr = stmt.value
  assert(ifExpr instanceof IfExpr)
})

//
// Test Util
//

function testProgram(input: string, expectedStatements: number): Stmt[] {
  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const statements = parser.parse()

  // check for parser errors
  if (parser.errors.length != 0) {
    for (const e of parser.errors) {
      console.log(e)
    }
    assert.fail('Parser has errors')
  }

  assert.equal(
    statements.length,
    expectedStatements,
    `Expected ${expectedStatements} statements, got=${statements.length}`
  )

  return statements
}

function testIntegerExpr(expr: Expr, value: number) {
  assert(expr instanceof Int)
  assert.equal(expr.value, value)
}

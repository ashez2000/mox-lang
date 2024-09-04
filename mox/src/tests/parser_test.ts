import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Parser } from '../parser.js'
import { Lexer } from '../lexer.js'
import { TokenType } from '../token.js'

import * as Expr from '../ast/expr.js'
import * as Stmt from '../ast/stmt.js'

test('test parseLetStatement', () => {
  const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `

  const expectedStatements = 3
  const statements = testProgram(input, expectedStatements)

  for (let i = 0; i < 3; i++) {
    const s = statements[i]
    assert(s instanceof Stmt.Let)
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
    assert(stmt instanceof Stmt.Return)
  }
})

test('test parseIdentifier', () => {
  const input = 'foobar;'
  const expectedStatements = 1
  const statements = testProgram(input, expectedStatements)

  const stmt = statements[0]
  assert(stmt instanceof Stmt.Expr)

  const ident = stmt.expr
  assert(ident instanceof Expr.Ident)
  assert.equal(ident.name, 'foobar')
})

test('test parseInteger', () => {
  const input = '5;'
  const expectedStatements = 1
  const statements = testProgram(input, expectedStatements)

  const stmt = statements[0]
  assert(stmt instanceof Stmt.Expr)

  testIntegerExpr(stmt.expr, 5)
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
    assert(stmt instanceof Stmt.Expr)

    const bool = stmt.expr
    assert(bool instanceof Expr.Bool)
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
    assert(stmt instanceof Stmt.Expr)

    const prefix = stmt.expr
    assert(prefix instanceof Expr.Prefix)
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
    assert(stmt instanceof Stmt.Expr)
    testInfixExpr(stmt.expr, t.left, t.operator, t.right)
  }
})

test('test parseIfExpression', () => {
  const input = 'if (x < y) { x }'
  const expectedStatements = 1
  const statements = testProgram(input, expectedStatements)

  const stmt = statements[0]
  assert(stmt instanceof Stmt.Expr)

  const ifExpr = stmt.expr
  assert(ifExpr instanceof Expr.If)
})

test('test parseFnExpr', () => {
  const input = 'fn (x, y) { x + y; }'

  const statements = testProgram(input, 1)
  const stmt = statements[0]
  assert(stmt instanceof Stmt.Expr)

  const fnExpr = stmt.expr
  assert(fnExpr instanceof Expr.Func)

  assert.equal(fnExpr.parameters.length, 2)
  testLiteralExpr(fnExpr.parameters[0], 'x')
  testLiteralExpr(fnExpr.parameters[1], 'y')

  const body = fnExpr.body
  assert.equal(body.statements.length, 1)
  const bodyStmt = body.statements[0]
  assert(bodyStmt instanceof Stmt.Expr)
  testInfixExpr(bodyStmt.expr, 'x', '+', 'y')
})

test('test parseCallExpr', () => {
  const input = 'add(1, 2 * 3, 4 + 5)'
  const statements = testProgram(input, 1)
  const stmt = statements[0]
  assert(stmt instanceof Stmt.Expr)

  const callExpr = stmt.expr
  assert(callExpr instanceof Expr.Call)
  assert(callExpr.func instanceof Expr.Ident)
  assert(callExpr.func.name, 'add')
  assert.equal(callExpr.args.length, 3)
  testLiteralExpr(callExpr.args[0], 1)
  testInfixExpr(callExpr.args[1], 2, '*', 3)
  testInfixExpr(callExpr.args[2], 4, '+', 5)
})

test('parse: test parseArrayLiteral', () => {
  const input = '[1, 2 * 2, 3 + 3]'
  const statements = testProgram(input, 1)

  const stmt = statements[0]
  assert(stmt instanceof Stmt.Expr)

  assert(stmt.expr instanceof Expr.Array)

  const elements = stmt.expr.elements
  assert.equal(elements.length, 3)
  testIntegerExpr(elements[0], 1)
  testInfixExpr(elements[1], 2, '*', 2)
  testInfixExpr(elements[2], 3, '+', 3)
})

//
// Test Util
//

function testProgram(input: string, expectedStatements: number): Stmt.Stmt[] {
  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)
  const program = parser.parse()

  // check for parser errors
  if (parser.errors.length != 0) {
    for (const e of parser.errors) {
      console.log(e)
    }
    assert.fail('Parser has errors')
  }

  assert.equal(
    program.statements.length,
    expectedStatements,
    `Expected ${expectedStatements} statements, got=${program.statements.length}`
  )

  return program.statements
}

function testIntegerExpr(expr: Expr.Expr, value: number) {
  assert(expr instanceof Expr.Int)
  assert.equal(expr.value, value)
}

function testIdent(expr: Expr.Expr, name: string) {
  assert(expr instanceof Expr.Ident)
  assert(expr.token.type == TokenType.IDENT)
  assert(expr.name == name)
}

function testLiteralExpr(expr: Expr.Expr, expected: any) {
  if (typeof expected == 'number') {
    testIntegerExpr(expr, expected)
    return
  }

  if (typeof expected == 'string') {
    testIdent(expr, expected)
    return
  }

  assert.fail('unknown expected value type')
}

function testInfixExpr(expr: Expr.Expr, left: any, op: string, right: any) {
  assert(expr instanceof Expr.Infix)
  testLiteralExpr(expr.left, left)
  assert(op == expr.operator)
  testLiteralExpr(expr.right, right)
}

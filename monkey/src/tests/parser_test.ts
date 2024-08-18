import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Parser } from '../parser.js'
import { Lexer } from '../lexer.js'
import { Expr, Expression, Identifier, Integer, Let, Prefix, Return } from '../ast.js'

test('test parseLetStatement', () => {
  const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)

  const statements = parser.parse()
  checkParserErrors(parser)
  assert.equal(statements.length, 3, `Expected 3 statements, got=${statements.length}`)

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

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)

  const statements = parser.parse()
  checkParserErrors(parser)
  assert.equal(statements.length, 3, `Expected 3 statements, got=${statements.length}`)

  for (let i = 0; i < 3; i++) {
    const stmt = statements[i]
    assert(stmt instanceof Return)
  }
})

test('test parseIdentifier', () => {
  const input = 'foobar;'

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)

  const statements = parser.parse()
  checkParserErrors(parser)
  assert.equal(statements.length, 1, `Expected 1 statements, got=${statements.length}`)

  const stmt = statements[0]
  assert(stmt instanceof Expression)

  const ident = stmt.expr
  assert(ident instanceof Identifier)
  assert.equal(ident.value, 'foobar')
})

test('test parseInteger', () => {
  const input = '5;'

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)

  const statements = parser.parse()
  checkParserErrors(parser)
  assert.equal(statements.length, 1, `Expected 1 statements, got=${statements.length}`)

  const stmt = statements[0]
  assert(stmt instanceof Expression)

  testIntegerExpr(stmt.expr, 5)
})

test('test parsePrefixExpreesion', () => {
  const tests = [
    { input: '!15;', operator: '!', value: 15 },
    { input: '-15;', operator: '-', value: 15 },
  ]

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i]
    const lexer = Lexer.new(t.input)
    const parser = Parser.new(lexer)

    const statements = parser.parse()
    checkParserErrors(parser)
    assert.equal(statements.length, 1, `Expected 1 statements, got=${statements.length}`)

    const stmt = statements[0]
    assert(stmt instanceof Expression)

    const prefix = stmt.expr
    assert(prefix instanceof Prefix)
    assert.equal(prefix.operator, t.operator)
    testIntegerExpr(prefix.right, t.value)
  }
})

//
// Test Util
//

function checkParserErrors(parser: Parser) {
  if (parser.errors.length === 0) return
  for (const e of parser.errors) {
    console.log(e)
  }
  assert.fail('Parser has errors')
}

function testIntegerExpr(expr: Expr, value: number) {
  assert(expr instanceof Integer)
  assert.equal(expr.value, value)
}

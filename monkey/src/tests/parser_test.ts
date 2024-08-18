import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Parser } from '../parser.js'
import { Lexer } from '../lexer.js'
import { Expression, Identifier, Integer, Let, Return } from '../ast.js'

test('test parseLetStatement', () => {
  const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `

  const lexer = Lexer.new(input)
  const parser = Parser.new(lexer)

  const statements = parser.parse()
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
  assert.equal(statements.length, 1, `Expected 1 statements, got=${statements.length}`)

  const stmt = statements[0]
  assert(stmt instanceof Expression)

  const ident = stmt.expr
  assert(ident instanceof Integer)
  assert.equal(ident.value, 5)
})

import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { TokenType, tokenTypeToString } from '../token.js'
import { buildLexer } from '../lexer.js'

test('lexer: test single character tokens', () => {
  const input = '=+-!*/<>,;:(){}[]'
  const { tokenIter, errors } = buildLexer(input)

  assert.equal(errors.length, 0)

  const tests: [TokenType, string][] = [
    [TokenType.ASSIGN, '='],
    [TokenType.PLUS, '+'],
    [TokenType.MINUS, '-'],
    [TokenType.BANG, '!'],
    [TokenType.ASTERISK, '*'],
    [TokenType.SLASH, '/'],
    [TokenType.LT, '<'],
    [TokenType.GT, '>'],
    [TokenType.COMMA, ','],
    [TokenType.SEMICOLON, ';'],
    [TokenType.COLON, ':'],
    [TokenType.LPAREN, '('],
    [TokenType.RPAREN, ')'],
    [TokenType.LBRACE, '{'],
    [TokenType.RBRACE, '}'],
    [TokenType.LBRACKET, '['],
    [TokenType.RBRACKET, ']'],
    [TokenType.EOF, '\0'],
  ]

  for (const [type, literal] of tests) {
    const tok = tokenIter.next()
    assert.equal(tokenTypeToString(tok.type), tokenTypeToString(type))
    assert.equal(tok.literal, literal)
  }
})

test('lexer: test two character tokens', () => {
  const input = '== !='
  const { tokenIter, errors } = buildLexer(input)

  assert.equal(errors.length, 0)

  const tests: [TokenType, string][] = [
    [TokenType.EQUAL, '=='],
    [TokenType.NOT_EQUAL, '!='],
    [TokenType.EOF, '\0'],
  ]

  for (const [type, literal] of tests) {
    const tok = tokenIter.next()
    assert.equal(tokenTypeToString(tok.type), tokenTypeToString(type))
    assert.equal(tok.literal, literal)
  }
})

test('lexer: test integer literals', () => {
  const input = '1 2345'
  const { tokenIter, errors } = buildLexer(input)

  assert.equal(errors.length, 0)

  const tests: [TokenType, string][] = [
    [TokenType.INT, '1'],
    [TokenType.INT, '2345'],
    [TokenType.EOF, '\0'],
  ]

  for (const [type, literal] of tests) {
    const tok = tokenIter.next()
    assert.equal(tokenTypeToString(tok.type), tokenTypeToString(type))
    assert.equal(tok.literal, literal)
  }
})

test('lexer: test string literals', () => {
  const input = '"foobar" "!@#$!#//"'
  const { tokenIter, errors } = buildLexer(input)

  assert.equal(errors.length, 0)

  const tests: [TokenType, string][] = [
    [TokenType.STRING, '"foobar"'],
    [TokenType.STRING, '"!@#$!#//"'],
    [TokenType.EOF, '\0'],
  ]

  for (const [type, literal] of tests) {
    const tok = tokenIter.next()
    assert.equal(tokenTypeToString(tok.type), tokenTypeToString(type))
    assert.equal(tok.literal, literal)
  }
})

test('lexer: test keywords', () => {
  const input = 'fn let true false if else return print'
  const { tokenIter, errors } = buildLexer(input)

  assert.equal(errors.length, 0)

  const tests: [TokenType, string][] = [
    [TokenType.FUNCTION, 'fn'],
    [TokenType.LET, 'let'],
    [TokenType.TRUE, 'true'],
    [TokenType.FALSE, 'false'],
    [TokenType.IF, 'if'],
    [TokenType.ELSE, 'else'],
    [TokenType.RETURN, 'return'],
    [TokenType.PRINT, 'print'],
    [TokenType.EOF, '\0'],
  ]

  for (const [type, literal] of tests) {
    const tok = tokenIter.next()
    assert.equal(tokenTypeToString(tok.type), tokenTypeToString(type))
    assert.equal(tok.literal, literal)
  }
})

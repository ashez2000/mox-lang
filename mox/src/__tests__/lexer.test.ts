import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { Lexer } from '../lexer.js'
import { Token, TokenType } from '../token.js'

test('test keywords', () => {
  let input = 'fn let true false if else return'
  let tests = [
    new Token(TokenType.Function),
    new Token(TokenType.Let),
    new Token(TokenType.True),
    new Token(TokenType.False),
    new Token(TokenType.If),
    new Token(TokenType.Else),
    new Token(TokenType.Return),
    new Token(TokenType.Eof),
  ]

  let l = new Lexer(input)
  let tokens = l.scanTokens()

  for (let i = 0; i < tests.length; i++) {
    let t = tokens[i]
    assert.equal(t.type, tests[i].type)
  }
})

test('test literals', () => {
  let input = '5 10 "foobar"'
  let tests = [
    new Token(TokenType.Int, 1, '5'),
    new Token(TokenType.Int, 1, '10'),
    new Token(TokenType.String, 1, 'foobar'),
  ]

  let l = new Lexer(input)
  let tokens = l.scanTokens()

  for (let i = 0; i < tests.length; i++) {
    let t = tokens[i]
    assert.equal(t.type, tests[i].type)
  }
})

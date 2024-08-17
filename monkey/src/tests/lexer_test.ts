import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Lexer } from '../lexer.js'
import { Token, TokenType } from '../token.js'

test('test nextToken', () => {
  const input = '=+(){},;'

  const tests = [
    /* 00 */ Token.new(TokenType.ASSIGN, '='),
    /* 01 */ Token.new(TokenType.PLUS, '+'),
    /* 02 */ Token.new(TokenType.LPAREN, '('),
    /* 03 */ Token.new(TokenType.RPAREN, ')'),
    /* 04 */ Token.new(TokenType.LBRACE, '{'),
    /* 05 */ Token.new(TokenType.RBRACE, '}'),
    /* 06 */ Token.new(TokenType.COMMA, ','),
    /* 07 */ Token.new(TokenType.SEMICOLON, ';'),
  ]

  const lexer = Lexer.new(input)

  for (let i = 0; i < tests.length; i++) {
    const tok = lexer.nextToken()
    const t = tests[i]

    assert.equal(
      tok.type,
      t.type,
      `tests[${i}] expected=${t.type}, got=${tok.type}`
    )

    assert.equal(
      tok.literal,
      t.literal,
      `tests[${i}] expected=${t.literal}, got=${tok.literal}`
    )
  }
})

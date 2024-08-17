import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Lexer } from '../lexer.js'
import { Token, TokenType } from '../token.js'

test('test nextToken', () => {
  const input = `
    let five = 5;
    let ten = 10;
    let add = fn (x, y) { x + y; };
    let result = add(five, ten);
  `

  const tests = [
    // let five = 5;
    /* 00 */ Token.new(TokenType.LET, 'let'),
    /* 01 */ Token.new(TokenType.IDENT, 'five'),
    /* 02 */ Token.new(TokenType.ASSIGN, '='),
    /* 03 */ Token.new(TokenType.INT, '5'),
    /* 04 */ Token.new(TokenType.SEMICOLON, ';'),

    // let ten = 10;
    /* 05 */ Token.new(TokenType.LET, 'let'),
    /* 06 */ Token.new(TokenType.IDENT, 'ten'),
    /* 07 */ Token.new(TokenType.ASSIGN, '='),
    /* 08 */ Token.new(TokenType.INT, '10'),
    /* 09 */ Token.new(TokenType.SEMICOLON, ';'),

    // let add = fn (x, y) { x + y; };
    /* 10 */ Token.new(TokenType.LET, 'let'),
    /* 11 */ Token.new(TokenType.IDENT, 'add'),
    /* 12 */ Token.new(TokenType.ASSIGN, '='),
    /* 13 */ Token.new(TokenType.FUNCTION, 'fn'),
    /* 14 */ Token.new(TokenType.LPAREN, '('),
    /* 15 */ Token.new(TokenType.IDENT, 'x'),
    /* 16 */ Token.new(TokenType.COMMA, ','),
    /* 17 */ Token.new(TokenType.IDENT, 'y'),
    /* 18 */ Token.new(TokenType.RPAREN, ')'),
    /* 19 */ Token.new(TokenType.LBRACE, '{'),
    /* 20 */ Token.new(TokenType.IDENT, 'x'),
    /* 21 */ Token.new(TokenType.PLUS, '+'),
    /* 22 */ Token.new(TokenType.IDENT, 'y'),
    /* 23 */ Token.new(TokenType.SEMICOLON, ';'),
    /* 24 */ Token.new(TokenType.RBRACE, '}'),
    /* 25 */ Token.new(TokenType.SEMICOLON, ';'),

    // let result = add(five, ten);
    /* 26 */ Token.new(TokenType.LET, 'let'),
    /* 27 */ Token.new(TokenType.IDENT, 'result'),
    /* 28 */ Token.new(TokenType.ASSIGN, '='),
    /* 29 */ Token.new(TokenType.IDENT, 'add'),
    /* 30 */ Token.new(TokenType.LPAREN, '('),
    /* 31 */ Token.new(TokenType.IDENT, 'five'),
    /* 32 */ Token.new(TokenType.COMMA, ','),
    /* 33 */ Token.new(TokenType.IDENT, 'ten'),
    /* 34 */ Token.new(TokenType.RPAREN, ')'),
    /* 35 */ Token.new(TokenType.SEMICOLON, ';'),
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

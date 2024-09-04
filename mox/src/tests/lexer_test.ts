import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Lexer } from '../lexer.js'
import { Token, TokenType } from '../token.js'

test('lexer: test nextToken', () => {
  const input = `\
    let five = 5;
    let ten = 10;
    let add = fn (x, y) { x + y; };
    let result = add(five, ten);

    !-/*5;
    5 < 10 > 5;

    if (5 < 10) { return true; }
    else { return false; }

    10 == 10;
    10 != 9;

    "foobar";
    "foo bar";

    [1, 2];

    {"foo" : "bar"};
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

    // !-/*5;
    /* 36 */ Token.new(TokenType.BANG, '!'),
    /* 37 */ Token.new(TokenType.MINUS, '-'),
    /* 38 */ Token.new(TokenType.SLASH, '/'),
    /* 39 */ Token.new(TokenType.ASTERISK, '*'),
    /* 40 */ Token.new(TokenType.INT, '5'),
    /* 41 */ Token.new(TokenType.SEMICOLON, ';'),

    // 5 < 10 > 5;
    /* 42 */ Token.new(TokenType.INT, '5'),
    /* 43 */ Token.new(TokenType.LT, '<'),
    /* 44 */ Token.new(TokenType.INT, '10'),
    /* 45 */ Token.new(TokenType.GT, '>'),
    /* 46 */ Token.new(TokenType.INT, '5'),
    /* 47 */ Token.new(TokenType.SEMICOLON, ';'),

    // if (5 < 10) { return true; }
    /* 48 */ Token.new(TokenType.IF, 'if'),
    /* 49 */ Token.new(TokenType.LPAREN, '('),
    /* 50 */ Token.new(TokenType.INT, '5'),
    /* 51 */ Token.new(TokenType.LT, '<'),
    /* 52 */ Token.new(TokenType.INT, '10'),
    /* 53 */ Token.new(TokenType.RPAREN, ')'),
    /* 54 */ Token.new(TokenType.LBRACE, '{'),
    /* 55 */ Token.new(TokenType.RETURN, 'return'),
    /* 56 */ Token.new(TokenType.TRUE, 'true'),
    /* 57 */ Token.new(TokenType.SEMICOLON, ';'),
    /* 58 */ Token.new(TokenType.RBRACE, '}'),

    // else { return false; }
    /* 59 */ Token.new(TokenType.ELSE, 'else'),
    /* 60 */ Token.new(TokenType.LBRACE, '{'),
    /* 61 */ Token.new(TokenType.RETURN, 'return'),
    /* 62 */ Token.new(TokenType.FALSE, 'false'),
    /* 63 */ Token.new(TokenType.SEMICOLON, ';'),
    /* 64 */ Token.new(TokenType.RBRACE, '}'),

    // 10 == 10;
    /* 65 */ Token.new(TokenType.INT, '10'),
    /* 66 */ Token.new(TokenType.EQ, '=='),
    /* 67 */ Token.new(TokenType.INT, '10'),
    /* 68 */ Token.new(TokenType.SEMICOLON, ';'),

    //  10 != 9;
    /* 69 */ Token.new(TokenType.INT, '10'),
    /* 70 */ Token.new(TokenType.NE, '!='),
    /* 71 */ Token.new(TokenType.INT, '9'),
    /* 72 */ Token.new(TokenType.SEMICOLON, ';'),

    // "foobar"; "foo bar";
    /* 73 */ Token.new(TokenType.STRING, 'foobar'),
    /* 74 */ Token.new(TokenType.SEMICOLON, ';'),
    /* 75 */ Token.new(TokenType.STRING, 'foo bar'),
    /* 76 */ Token.new(TokenType.SEMICOLON, ';'),

    // [1, 2];
    /* 77 */ Token.new(TokenType.LBRACKET, '['),
    /* 78 */ Token.new(TokenType.INT, '1'),
    /* 79 */ Token.new(TokenType.COMMA, ','),
    /* 80 */ Token.new(TokenType.INT, '2'),
    /* 81 */ Token.new(TokenType.RBRACKET, ']'),
    /* 82 */ Token.new(TokenType.SEMICOLON, ';'),

    // {"foo": "bar"};
    /* 83 */ Token.new(TokenType.LBRACE, '{'),
    /* 84 */ Token.new(TokenType.STRING, 'foo'),
    /* 85 */ Token.new(TokenType.COLON, ':'),
    /* 86 */ Token.new(TokenType.STRING, 'bar'),
    /* 87 */ Token.new(TokenType.RBRACE, '}'),
    /* 88 */ Token.new(TokenType.SEMICOLON, ';'),
  ]

  const lexer = Lexer.new(input)

  for (let i = 0; i < tests.length; i++) {
    const tok = lexer.nextToken()
    const t = tests[i]

    assert.equal(tok.type, t.type, `tests[${i}] expected=${t.type}, got=${tok.type}`)
    assert.equal(tok.literal, t.literal, `tests[${i}] expected=${t.literal}, got=${tok.literal}`)
  }
})

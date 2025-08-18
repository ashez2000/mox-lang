export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',

  // Identifiers and literals
  IDENT = 'IDENT',
  INT = 'INT',
  STRING = 'STRING',

  // Operators
  ASSIGN = 'ASSIGN',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  BANG = 'BANG',
  ASTERISK = 'ASTERISK',
  SLASH = 'SLASH',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_EQ = 'LESS_THAN_EQ',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_EQ = 'GREATER_THAN_EQ',
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',

  // Delimiters
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',

  // Keywords
  FUNC = 'FUNC',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
  PRINT = 'PRINT',
}

export class Token {
  constructor(public type: TokenType, public literal: string, public line: number = 0) {}
}

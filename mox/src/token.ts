export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  IDENT = 'IDENT',
  INT = 'INT',
  STRING = 'STRING',
  ASSIGN = 'ASSIGN',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  BANG = 'BANG',
  ASTERISK = 'ASTERISK',
  SLASH = 'SLASH',
  LT = 'LT',
  GT = 'GT',
  EQ = 'EQ',
  NE = 'NE',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
  PRINT = 'PRINT',
}

export class Token {
  constructor(public type: TokenType, public literal: string, public line: number) {}

  static new(type: TokenType, literal: string, line: number = 0) {
    return new Token(type, literal, line)
  }
}

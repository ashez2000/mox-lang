export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  IDENT = 'IDENT',
  INT = 'INT',
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
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
}

export class Token {
  constructor(public type: TokenType, public literal: string) {}

  static new(type: TokenType, literal: string) {
    return new Token(type, literal)
  }
}

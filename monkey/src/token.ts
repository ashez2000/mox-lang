export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  IDENT = 'IDENT',
  INT = 'INT',
  ASSIGN = 'ASSIGN',
  PLUS = 'PLUS',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  FUNCTION = 'FUNCTION',
  LET = 'LET',
}

export class Token {
  constructor(public type: TokenType, public literal: string) {}

  static new(type: TokenType, literal: string) {
    return new Token(type, literal)
  }
}

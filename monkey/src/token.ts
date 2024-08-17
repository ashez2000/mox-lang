export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  IDENT = 'IDENT',
  INT = 'INT',
  ASSIGN = 'ASSIGN',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  PBRACE = 'RBRACE',
  FUNCTION = 'FUNCTION',
  LET = 'LET',
}

export class Token {
  constructor(public type: TokenType, public literal: string) {}

  static new(type: TokenType, literal: string) {
    return new Token(type, literal)
  }
}

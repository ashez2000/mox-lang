/** Token types in mox language */
export enum TokenType {
  ILLEGAL = 0,
  EOF,

  IDENT,
  INT,
  STRING,

  ASSIGN,
  PLUS,
  MINUS,
  BANG,
  ASTERISK,
  SLASH,
  LT,
  GT,
  EQUAL,
  NOT_EQUAL,

  COMMA,
  SEMICOLON,
  COLON,
  LPAREN,
  RPAREN,
  LBRACE,
  RBRACE,
  LBRACKET,
  RBRACKET,

  FUNCTION,
  LET,
  TRUE,
  FALSE,
  IF,
  ELSE,
  RETURN,
  PRINT,
}

/** Converts TokenType to String */
export function tokenTypeToString(type: TokenType) {
  switch (type) {
    case TokenType.ILLEGAL:
      return 'ILLEGAL'
    case TokenType.EOF:
      return 'EOF'
    case TokenType.IDENT:
      return 'IDENT'
    case TokenType.INT:
      return 'INT'
    case TokenType.STRING:
      return 'STRING'
    case TokenType.ASSIGN:
      return 'ASSIGN'
    case TokenType.PLUS:
      return 'PLUS'
    case TokenType.MINUS:
      return 'MINUS'
    case TokenType.BANG:
      return 'BANG'
    case TokenType.ASTERISK:
      return 'ASTERISK'
    case TokenType.SLASH:
      return 'SLASH'
    case TokenType.LT:
      return 'LT'
    case TokenType.GT:
      return 'GT'
    case TokenType.EQUAL:
      return 'EQUAL'
    case TokenType.NOT_EQUAL:
      return 'NOT_EQUAL'
    case TokenType.COMMA:
      return 'COMMA'
    case TokenType.SEMICOLON:
      return 'SEMICOLON'
    case TokenType.COLON:
      return 'COLON'
    case TokenType.LPAREN:
      return 'LPAREN'
    case TokenType.RPAREN:
      return 'RPAREN'
    case TokenType.LBRACE:
      return 'LBRACE'
    case TokenType.RBRACE:
      return 'RBRACE'
    case TokenType.LBRACKET:
      return 'LBRACKET'
    case TokenType.RBRACKET:
      return 'RBRACKET'
    case TokenType.FUNCTION:
      return 'FUNCTION'
    case TokenType.LET:
      return 'LET'
    case TokenType.TRUE:
      return 'TRUE'
    case TokenType.FALSE:
      return 'FALSE'
    case TokenType.IF:
      return 'IF'
    case TokenType.ELSE:
      return 'ELSE'
    case TokenType.RETURN:
      return 'RETURN'
    case TokenType.PRINT:
      return 'PRINT'
  }
}

export class Token {
  constructor(public type: TokenType, public literal: string, public line: number) {}
}

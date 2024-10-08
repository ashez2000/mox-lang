import { TokenType } from './token'

export enum Precedence {
  LOWEST = 0,
  EQUALS,
  LTGT,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
  INDEX,
}

export const precedences = new Map<TokenType, Precedence>([
  [TokenType.EQ, Precedence.EQUALS],
  [TokenType.NE, Precedence.EQUALS],
  [TokenType.LT, Precedence.LTGT],
  [TokenType.GT, Precedence.LTGT],
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.SLASH, Precedence.PRODUCT],
  [TokenType.ASTERISK, Precedence.PRODUCT],
  [TokenType.LPAREN, Precedence.CALL],
  [TokenType.LBRACKET, Precedence.INDEX],
])

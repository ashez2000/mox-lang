import { TokenType } from './token'

export enum PrecedenceLevel {
  LOWEST = 0,
  EQUALS,
  LTGT,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
}

export const precedences = new Map<TokenType, PrecedenceLevel>([
  [TokenType.EQ, PrecedenceLevel.EQUALS],
  [TokenType.NE, PrecedenceLevel.EQUALS],
  [TokenType.LT, PrecedenceLevel.LTGT],
  [TokenType.GT, PrecedenceLevel.EQUALS],
  [TokenType.PLUS, PrecedenceLevel.SUM],
  [TokenType.MINUS, PrecedenceLevel.SUM],
  [TokenType.SLASH, PrecedenceLevel.PRODUCT],
  [TokenType.ASTERISK, PrecedenceLevel.PRODUCT],
])

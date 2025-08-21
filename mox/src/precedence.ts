import { TokenType } from './token.js'

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
  [TokenType.EQUAL, Precedence.EQUALS],
  [TokenType.NOT_EQUAL, Precedence.EQUALS],
  [TokenType.LESS_THAN, Precedence.LTGT],
  [TokenType.GREATER_THAN, Precedence.LTGT],
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.SLASH, Precedence.PRODUCT],
  [TokenType.ASTERISK, Precedence.PRODUCT],
  [TokenType.LEFT_PAREN, Precedence.CALL],
  [TokenType.LEFT_BRACE, Precedence.INDEX],
])

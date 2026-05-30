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
  [TokenType.Eq, Precedence.EQUALS],
  [TokenType.NotEq, Precedence.EQUALS],
  [TokenType.Lt, Precedence.LTGT],
  [TokenType.Gt, Precedence.LTGT],
  [TokenType.Plus, Precedence.SUM],
  [TokenType.Minus, Precedence.SUM],
  [TokenType.Slash, Precedence.PRODUCT],
  [TokenType.Asterisk, Precedence.PRODUCT],
  [TokenType.LParen, Precedence.CALL],
  [TokenType.LBrace, Precedence.INDEX],
])

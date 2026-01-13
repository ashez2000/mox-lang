import { TokenType } from './token.js'

export enum Precedence {
  Lowest = 0,
  Equals,
  LessGreater,
  Sum,
  Product,
  Prefix,
  Call,
  Index,
}

export const precedences = new Map<TokenType, Precedence>([
  [TokenType.Eq, Precedence.Equals],
  [TokenType.NotEq, Precedence.Equals],
  [TokenType.Lt, Precedence.LessGreater],
  [TokenType.Gt, Precedence.LessGreater],
  [TokenType.Plus, Precedence.Sum],
  [TokenType.Minus, Precedence.Sum],
  [TokenType.Slash, Precedence.Product],
  [TokenType.Asterisk, Precedence.Product],
  [TokenType.LParen, Precedence.Call],
  [TokenType.LBracket, Precedence.Index],
])

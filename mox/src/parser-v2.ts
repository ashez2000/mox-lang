import { Expr, Stmt } from './ast.js'
import { Token, TokenType } from './token-v2.js'

export class Parser {
  private tokenIter: TokenIter
  private curToken: Token
  private peekToken: Token
  private prefixParseFns: Map<TokenType, PrefixParseFn>
  private infixParseFns: Map<TokenType, InfixParseFn>

  public errors: string[] = []

  constructor(tokens: Token[]) {
    this.tokenIter = new TokenIter(tokens)
    this.curToken = this.tokenIter.next()
    this.peekToken = this.tokenIter.next()
    this.prefixParseFns = new Map()
    this.infixParseFns = new Map()
  }

  parse(): Stmt[] {
    let statements: Stmt[] = []

    while (this.curToken.type != TokenType.Eof) {
      try {
        let stmt = this.parseStmt()
        statements.push(stmt)
      } catch (e: any) {
        this.errors.push((e as Error).message)
        // TODO: Synchronize
      }
    }

    return statements
  }

  private parseStmt(): Stmt {
    switch (this.curToken.type) {
      case TokenType.Let:
      case TokenType.Return:
      default:
        return this.parseExprStmt()
    }
  }

  private parseExprStmt(): Stmt {
    return { type: 'ExprStmt', value: this.parseExpr(Precedence.Lowest) }
  }

  private parseExpr(precedence: Precedence): Expr {
    return {}
  }
}

type PrefixParseFn = () => {}
type InfixParseFn = () => {}

const enum Precedence {
  Lowest = 0,
  Equals,
  LessGreater,
  Sum,
  Product,
  Prefix,
  Call,
  Index,
}

const precedence = new Map<TokenType, Precedence>([
  [TokenType.Eq, Precedence.Equals],
  [TokenType.NotEq, Precedence.Equals],
  [TokenType.Lt, Precedence.LessGreater],
  [TokenType.Gt, Precedence.LessGreater],
  [TokenType.Plus, Precedence.Sum],
  [TokenType.Minus, Precedence.Sum],
  [TokenType.Asterisk, Precedence.Product],
  [TokenType.Slash, Precedence.Product],
  [TokenType.LParen, Precedence.Call],
  [TokenType.LBracket, Precedence.Index],
])

class TokenIter {
  private cur: number = 0

  constructor(private tokens: Token[]) {}

  next(): Token {
    if (this.cur >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]
    }
    return this.tokens[this.cur++]
  }
}

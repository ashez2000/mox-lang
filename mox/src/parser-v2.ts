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
        this.nextToken()
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
        return this.parseLetStmt()
      case TokenType.Return:
        return this.parseReturnStmt()
      default:
        return this.parseExprStmt()
    }
  }

  // let <ident> = <expr>;
  private parseLetStmt(): Stmt {
    this.expectPeek(TokenType.Ident)
    let ident = this.curToken
    this.expectPeek(TokenType.Assign)
    let expr = this.parseExpr(Precedence.Lowest)
    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }
    return { type: 'LetStmt', name: ident, value: expr }
  }

  // return <expr>;
  private parseReturnStmt(): Stmt {
    this.nextToken()
    let expr = this.parseExpr(Precedence.Lowest)
    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }
    return { type: 'ReturnStmt', value: expr }
  }

  private parseExprStmt(): Stmt {
    return { type: 'ExprStmt', value: this.parseExpr(Precedence.Lowest) }
  }

  private parseExpr(precedence: Precedence): Expr {
    return {}
  }

  //
  // Util methods
  //

  private nextToken(): void {
    this.curToken = this.peekToken
    this.peekToken = this.tokenIter.next()
  }

  private curTokenIs(type: TokenType) {
    return this.curToken.type == type
  }

  private peekTokenIs(type: TokenType) {
    return this.peekToken.type == type
  }

  /* expectPeek consumes curToken if peekToken type matches else throws error **/
  private expectPeek(type: TokenType): void {
    if (!this.peekTokenIs(type)) {
      throw new Error(`[line ${this.curToken.line}] Expected next token to be ${type}, got ${this.peekToken.type}`)
    }
    this.nextToken()
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

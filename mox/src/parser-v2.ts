import { AstType, Stmt, Expr } from './ast.js'
import { Lexer } from './lexer.js'
import { Token, TokenType } from './token.js'

export class Parser {
  private lexer: Lexer
  private curToken: Token
  private peekToken: Token
  private errors: string[] = []

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.curToken = lexer.nextToken()
    this.peekToken = lexer.nextToken()
  }

  public parse(): Stmt[] {
    let stmts: Stmt[] = []

    while (!this.curTokenIs(TokenType.Eof)) {
      try {
        let stmt = this.parseStmt()
        stmts.push(stmt)
      } catch (e) {
        let err = e as any as Error
        this.errors.push(err.message)
        // TODO: Synchronize
      } finally {
        this.nextToken()
      }
    }

    return stmts
  }

  private parseStmt(): Stmt {
    switch (this.curToken.type) {
      case TokenType.Let:
        return this.parseLetStmt()
      case TokenType.Return:
        return this.parseReturnStmt()
      case TokenType.Print:
        return this.parsePrintStmt()
      default:
        return this.parseExprStmt()
    }
  }

  // "let" <ident> "=" <expr> ";"
  private parseLetStmt(): Stmt {
    // <ident>
    this.expectPeek(TokenType.Ident)
    let name = this.curToken

    // "="
    this.expectPeek(TokenType.Assign)
    this.nextToken()

    // <expr>
    const expr = this.parseExpr(Precedence.Lowest)

    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return { type: AstType.LetStmt, name, expr }
  }

  // "return" <expr> ";"
  private parseReturnStmt(): Stmt {
    // "return"
    let keyword = this.curToken
    this.nextToken()

    // <expr>
    const expr = this.parseExpr(Precedence.Lowest)

    // ";"
    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return { type: AstType.ReturnStmt, keyword, expr }
  }

  // "print" <expr> ";"
  private parsePrintStmt(): Stmt {
    // "print"
    this.nextToken()

    // <expr>
    const expr = this.parseExpr(Precedence.Lowest)

    // ";"
    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return { type: AstType.PrintStmt, expr }
  }

  // <expr> ";"
  private parseExprStmt(): Stmt {
    // <expr>
    let expr = this.parseExpr(Precedence.Lowest)

    // ";"
    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return { type: AstType.ExprStmt, expr }
  }

  private parseExpr(precedence: Precedence): Expr {
    return { type: AstType.Null }
  }

  private nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
  }

  private curTokenIs(type: TokenType): boolean {
    return this.curToken.type == type
  }

  private peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type == type
  }

  private expectPeek(type: TokenType): void {
    if (!this.peekTokenIs(type)) {
      throw new Error(
        `[line: ${this.peekToken.line}] error: expected next token to be ${type}, got ${this.peekToken.type} instead`,
      )
    }

    this.nextToken()
  }

  private curPrecedence(): Precedence {
    return precedences.get(this.curToken.type) ?? Precedence.Lowest
  }

  private peekPrecedence(): Precedence {
    return precedences.get(this.peekToken.type) ?? Precedence.Lowest
  }
}

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

const precedences = new Map<TokenType, Precedence>([
  [TokenType.Eq, Precedence.Equals],
  [TokenType.NotEq, Precedence.Equals],
  [TokenType.Lt, Precedence.LessGreater],
  [TokenType.Gt, Precedence.LessGreater],
  [TokenType.Plus, Precedence.Sum],
  [TokenType.Minus, Precedence.Sum],
  [TokenType.Slash, Precedence.Product],
  [TokenType.Asterisk, Precedence.Product],
  [TokenType.LParen, Precedence.Call],
  [TokenType.LBrace, Precedence.Index],
])

import { AstType, Stmt, Expr, Ident } from './ast.js'
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
    let leftExpr: Expr

    switch (this.curToken.type) {
      case TokenType.Ident:
        leftExpr = this.parseIdent()
        break

      case TokenType.Int:
        leftExpr = this.parseInt()
        break

      case TokenType.True:
      case TokenType.False:
        leftExpr = this.parseBool()
        break

      case TokenType.String:
        leftExpr = this.parseString()
        break

      case TokenType.Bang:
      case TokenType.Minus:
        leftExpr = this.parsePrefixExpr()
        break

      case TokenType.LParen:
        leftExpr = this.parseGroupedExpr()
        break

      case TokenType.If:
        leftExpr = this.parseIfExpr()
        break

      case TokenType.Function:
        leftExpr = this.parseFnExpr()
        break

      default:
        throw new Error(`[line: ${this.curToken.line}] error: no prefix parse fn for type ${this.curToken.type}`)
    }

    return leftExpr
  }

  private parseIdent(): Ident {
    return { type: AstType.Ident, name: this.curToken }
  }

  private parseInt(): Expr {
    return { type: AstType.Int, value: parseInt(this.curToken.literal) }
  }

  private parseBool(): Expr {
    return { type: AstType.Bool, value: this.curToken.type == TokenType.True }
  }

  private parseString(): Expr {
    return { type: AstType.String, value: this.curToken.literal }
  }

  private parsePrefixExpr(): Expr {
    let op = this.curToken
    this.nextToken()

    let expr = this.parseExpr(Precedence.Prefix)
    return { type: AstType.Prefix, op, expr }
  }

  private parseGroupedExpr(): Expr {
    this.nextToken()
    const expr = this.parseExpr(Precedence.Lowest)
    this.expectPeek(TokenType.RParen)
    return expr
  }

  private parseBlock(): Stmt[] {
    const stmts: Stmt[] = []

    this.nextToken()

    while (!this.curTokenIs(TokenType.RBrace) && !this.curTokenIs(TokenType.Eof)) {
      const stmt = this.parseStmt()
      stmts.push(stmt)
      this.nextToken()
    }

    return stmts
  }

  private parseIfExpr(): Expr {
    this.expectPeek(TokenType.LParen)

    this.nextToken()
    let condition = this.parseExpr(Precedence.Lowest)

    this.expectPeek(TokenType.RParen)
    this.expectPeek(TokenType.LBrace)

    let thenBlock = this.parseBlock()

    if (this.peekTokenIs(TokenType.Else)) {
      this.nextToken()
      this.expectPeek(TokenType.LBrace)

      let elseBlock = this.parseBlock()
      return { type: AstType.If, condition, thenBlock, elseBlock }
    }

    return { type: AstType.If, condition, thenBlock }
  }

  private parseFnExpr(): Expr {
    this.expectPeek(TokenType.LParen)
    let parameters = this.parseFnParams()

    this.expectPeek(TokenType.LBrace)
    const body = this.parseBlock()

    return { type: AstType.Function, parameters, body }
  }

  private parseFnParams(): Ident[] {
    const idents: Ident[] = []

    if (this.peekTokenIs(TokenType.RParen)) {
      this.nextToken()
      return idents
    }

    this.nextToken()
    const ident = this.parseIdent()
    idents.push(ident)

    while (this.peekTokenIs(TokenType.Comma)) {
      this.nextToken()
      this.nextToken()
      const ident = this.parseIdent()
      idents.push(ident)
    }

    this.expectPeek(TokenType.RParen)

    return idents
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

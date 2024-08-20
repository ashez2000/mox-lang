import {
  BlockStmt,
  Bool,
  CallExpr,
  Expr,
  ExprStmt,
  FnExpr,
  Ident,
  IfExpr,
  Infix,
  Int,
  Let,
  Prefix,
  Return,
  Stmt,
} from './ast'

import { Lexer } from './lexer'
import { Token, TokenType } from './token'
import { Precedence, precedences } from './precedence'

type PrefixParseFn = () => Expr | null
type InfixParseFn = (left: Expr) => Expr | null

export class Parser {
  private lexer: Lexer
  private curToken: Token
  private peekToken: Token
  private prefixParseFns: Map<TokenType, PrefixParseFn>
  private infixParseFns: Map<TokenType, InfixParseFn>

  public errors: string[]

  private constructor(lexer: Lexer) {
    this.lexer = lexer
    this.curToken = Token.new(TokenType.EOF, '\0', 0)
    this.peekToken = Token.new(TokenType.EOF, '\0', 0)
    this.errors = []

    this.prefixParseFns = new Map([
      [TokenType.IDENT, this.parseIdent.bind(this)],
      [TokenType.INT, this.parseInteger.bind(this)],
      [TokenType.TRUE, this.parseBool.bind(this)],
      [TokenType.FALSE, this.parseBool.bind(this)],
      [TokenType.BANG, this.parsePrefix.bind(this)],
      [TokenType.MINUS, this.parsePrefix.bind(this)],
      [TokenType.LPAREN, this.parseGroupedExpr.bind(this)],
      [TokenType.IF, this.parseIfExpr.bind(this)],
      [TokenType.FUNCTION, this.parseFnExpr.bind(this)],
    ])

    this.infixParseFns = new Map([
      [TokenType.PLUS, this.parseInfix.bind(this)],
      [TokenType.MINUS, this.parseInfix.bind(this)],
      [TokenType.SLASH, this.parseInfix.bind(this)],
      [TokenType.ASTERISK, this.parseInfix.bind(this)],
      [TokenType.EQ, this.parseInfix.bind(this)],
      [TokenType.NE, this.parseInfix.bind(this)],
      [TokenType.LT, this.parseInfix.bind(this)],
      [TokenType.GT, this.parseInfix.bind(this)],
      [TokenType.LPAREN, this.parseCallExpr.bind(this)],
    ])
  }

  static new(lexer: Lexer): Parser {
    const parser = new Parser(lexer)
    parser.nextToken()
    parser.nextToken()
    return parser
  }

  parse(): Stmt[] {
    const statements: Stmt[] = []

    while (this.curToken.type != TokenType.EOF) {
      const stmt = this.parseStatement()
      if (stmt) {
        statements.push(stmt)
      }
      this.nextToken()
    }

    return statements
  }

  //
  // Stmt
  //

  private parseStatement(): Stmt | null {
    switch (this.curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement()
      case TokenType.RETURN:
        return this.parseReturnStatement()
      default:
        return this.parseExprStmt()
    }
  }

  // let <ident> = <expr>;
  private parseLetStatement(): Let | null {
    const letToken = this.curToken

    if (!this.expectPeek(TokenType.IDENT)) {
      return null
    }

    const ident = this.parseIdent()

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null
    }

    this.nextToken()

    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new Let(letToken, ident, value)
  }

  // return <expr>;
  private parseReturnStatement(): Return | null {
    const returnToken = this.curToken
    this.nextToken()

    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new Return(returnToken, value)
  }

  private parseExprStmt(): ExprStmt | null {
    const tok = this.curToken

    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    // optional semicolon after expression
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new ExprStmt(tok, value)
  }

  //
  // Expr
  //

  // core logic of Pratt Parser aka (Top Down Operator Precedence Parser)
  private parseExpression(precedence: Precedence): Expr | null {
    const prefix = this.prefixParseFns.get(this.curToken.type)
    if (!prefix) {
      this.noPrifixParseFnError()
      return null
    }

    let leftExpr = prefix()

    while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns.get(this.peekToken.type)
      if (!infix) {
        return leftExpr
      }

      // curToken becomes the operator
      this.nextToken()
      leftExpr = infix(leftExpr!) // these null cases are annoying
    }

    return leftExpr
  }

  private parseIdent(): Ident {
    return new Ident(this.curToken, this.curToken.literal)
  }

  private parseInteger(): Int {
    return new Int(this.curToken, parseInt(this.curToken.literal))
  }

  private parseBool(): Expr {
    return new Bool(this.curToken, this.curToken.literal == 'true' ? true : false)
  }

  private parsePrefix(): Prefix | null {
    const opToken = this.curToken
    this.nextToken()

    const right = this.parseExpression(Precedence.PREFIX)
    if (!right) {
      return null
    }

    return new Prefix(opToken, opToken.literal, right!)
  }

  private parseGroupedExpr(): Expr | null {
    this.nextToken() // "("

    const expr = this.parseExpression(Precedence.LOWEST)
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null
    }

    return expr
  }

  private parseInfix(left: Expr): Expr | null {
    const opToken = this.curToken
    const precedence = this.curPrecedence()

    this.nextToken()
    const right = this.parseExpression(precedence)
    if (!right) {
      return null
    }

    return new Infix(opToken, opToken.literal, left, right)
  }

  private parseBlock(): BlockStmt {
    const stmts: Stmt[] = []

    const tok = this.curToken
    this.nextToken()

    while (!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement()
      if (stmt != null) {
        stmts.push(stmt)
      }
      this.nextToken()
    }

    return new BlockStmt(tok, stmts)
  }

  private parseIfExpr(): IfExpr | null {
    const ifToken = this.curToken

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null
    }

    this.nextToken()

    const cond = this.parseExpression(Precedence.LOWEST)
    if (!cond) {
      return null
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null
    }

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null
    }

    const thenBlock = this.parseBlock()

    let elseBlock: BlockStmt | null = null
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken()
      if (!this.expectPeek(TokenType.LBRACE)) {
        return null
      }
      elseBlock = this.parseBlock()
    }

    return new IfExpr(ifToken, cond, thenBlock, elseBlock)
  }

  private parseFnExpr(): FnExpr | null {
    const fnToken = this.curToken

    if (!this.peekTokenIs(TokenType.LPAREN)) {
      return null
    }

    const params = this.parseFnParams()
    if (!params) {
      return null
    }

    if (!this.peekTokenIs(TokenType.LBRACE)) {
      return null
    }

    const body = this.parseBlock()

    return new FnExpr(fnToken, params, body)
  }

  private parseFnParams(): Ident[] | null {
    const idents: Ident[] = []

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken()
      return idents
    }

    this.nextToken()

    const ident = this.parseIdent()
    idents.push(ident)

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      const ident = this.parseIdent()
      idents.push(ident)
    }

    if (!this.peekTokenIs(TokenType.LBRACE)) {
      return null
    }

    return idents
  }

  private parseCallExpr(fnExpr: Expr): CallExpr | null {
    const tok = this.curToken

    const args = this.parseCallArgs()
    if (!args) {
      return null
    }

    return new CallExpr(tok, fnExpr, args)
  }

  private parseCallArgs(): Expr[] | null {
    const args: Expr[] = []

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken()
      return args
    }

    this.nextToken()

    const expr = this.parseExpression(Precedence.LOWEST)
    if (!expr) {
      return null
    }

    args.push(expr)

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      const expr = this.parseExpression(Precedence.LOWEST)
      if (!expr) {
        return null
      }

      args.push(expr)
    }

    if (this.expectPeek(TokenType.RPAREN)) {
      return null
    }

    return args
  }

  //
  // Util
  //

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

  /** if peek token is a match it calls nextToken() */
  private expectPeek(type: TokenType): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken()
      return true
    }
    this.errors.push(
      `[line ${this.peekToken.line}]: parse: error: expected peek token to be ${type}, got ${this.peekToken.type}`
    )
    return false
  }

  private noPrifixParseFnError() {
    this.errors.push(`[line ${this.curToken.line}]: parse: error: no prefix parse fn found for ${this.curToken.type}`)
  }

  private peekPrecedence(): Precedence {
    return precedences.get(this.peekToken.type) ?? Precedence.LOWEST
  }

  private curPrecedence(): Precedence {
    return precedences.get(this.curToken.type) ?? Precedence.LOWEST
  }
}

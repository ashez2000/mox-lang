import * as stmt from './stmt.js'
import * as expr from './expr.js'

import { TokenIter } from './lexer.js'
import { Token, TokenType } from './token.js'
import { Precedence, precedences } from './precedence.js'

type Stmt = stmt.Stmt
type Expr = expr.Expr

type PrefixParseFn = () => Expr | null
type InfixParseFn = (left: Expr) => Expr | null

export class Parser {
  private lexer: TokenIter
  private curToken: Token
  private peekToken: Token
  private prefixParseFns: Map<TokenType, PrefixParseFn>
  private infixParseFns: Map<TokenType, InfixParseFn>

  public errors: string[]

  public constructor(lexer: TokenIter) {
    this.lexer = lexer
    this.curToken = new Token(TokenType.Eof)
    this.peekToken = new Token(TokenType.Eof)
    this.errors = []

    this.prefixParseFns = new Map([
      [TokenType.Ident, this.parseIdent.bind(this)],
      [TokenType.Int, this.parseInteger.bind(this)],
      [TokenType.String, this.parseString.bind(this)],
      [TokenType.True, this.parseBool.bind(this)],
      [TokenType.False, this.parseBool.bind(this)],
      [TokenType.Bang, this.parsePrefix.bind(this)],
      [TokenType.Minus, this.parsePrefix.bind(this)],
      [TokenType.LParen, this.parseGroupedExpr.bind(this)],
      [TokenType.If, this.parseIfExpr.bind(this)],
      [TokenType.Function, this.parseFnExpr.bind(this)],
      [TokenType.LBracket, this.parseArrayLiteral.bind(this)],
      [TokenType.LBrace, this.parseHashMapLiteral.bind(this)],
    ])

    this.infixParseFns = new Map([
      [TokenType.Plus, this.parseInfix.bind(this)],
      [TokenType.Minus, this.parseInfix.bind(this)],
      [TokenType.Slash, this.parseInfix.bind(this)],
      [TokenType.Asterisk, this.parseInfix.bind(this)],
      [TokenType.Eq, this.parseInfix.bind(this)],
      [TokenType.NotEq, this.parseInfix.bind(this)],
      [TokenType.Lt, this.parseInfix.bind(this)],
      [TokenType.Gt, this.parseInfix.bind(this)],
      [TokenType.LParen, this.parseCallExpr.bind(this)],
      [TokenType.LBracket, this.parseIndexExpression.bind(this)],
    ])

    this.nextToken()
    this.nextToken()
  }

  parse(): stmt.Program {
    const statements: Stmt[] = []

    while (!this.curTokenIs(TokenType.Eof)) {
      const stmt = this.parseStatement()
      if (stmt) {
        statements.push(stmt)
      }
      this.nextToken()
    }

    return new stmt.Program(statements)
  }

  //
  // Stmt
  //

  private parseStatement(): Stmt | null {
    switch (this.curToken.type) {
      case TokenType.Let:
        return this.parseLetStatement()
      case TokenType.Return:
        return this.parseReturnStatement()
      default:
        return this.parseExprStmt()
    }
  }

  private parseLetStatement(): stmt.Let | null {
    if (
      !this.expectPeek(TokenType.Ident, "expected 'identifier' after 'let'")
    ) {
      return null
    }

    const name = this.parseIdent()

    if (!this.expectPeek(TokenType.Assign, "expected '=' after 'identifier'")) {
      return null
    }

    this.nextToken()

    const value = this.parseExpression(Precedence.Lowest)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return new stmt.Let(name, value)
  }

  private parseReturnStatement(): stmt.Return | null {
    const returnToken = this.curToken
    this.nextToken()

    const value = this.parseExpression(Precedence.Lowest)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return new stmt.Return(returnToken, value)
  }

  private parsePrintStatement(): stmt.Print | null {
    this.nextToken()
    const value = this.parseExpression(Precedence.Lowest)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return new stmt.Print(value)
  }

  private parseExprStmt(): stmt.Expression | null {
    const value = this.parseExpression(Precedence.Lowest)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return new stmt.Expression(value)
  }

  private parseBlock(): stmt.Block {
    const statements: Stmt[] = []
    this.nextToken()
    while (
      !this.curTokenIs(TokenType.RParen) &&
      !this.curTokenIs(TokenType.Eof)
    ) {
      const stmt = this.parseStatement()
      if (stmt != null) statements.push(stmt)
      this.nextToken()
    }
    return new stmt.Block(statements)
  }

  //
  // Expr
  //

  private parseExpression(precedence: Precedence): Expr | null {
    const prefix = this.prefixParseFns.get(this.curToken.type)
    if (!prefix) {
      this.noPrifixParseFnError()
      return null
    }

    let leftExpr = prefix()

    while (
      !this.peekTokenIs(TokenType.Semicolon) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns.get(this.peekToken.type)
      if (!infix) {
        return leftExpr
      }

      this.nextToken()

      // TODO: handle null case
      leftExpr = infix(leftExpr!)
    }

    return leftExpr
  }

  private parseIdent(): expr.Ident {
    return new expr.Ident(this.curToken)
  }

  private parseInteger(): expr.Int {
    return new expr.Int(parseInt(this.curToken.literal!))
  }

  private parseBool(): expr.Bool {
    return new expr.Bool(this.curToken.literal == 'true' ? true : false)
  }

  private parseString(): expr.String {
    return new expr.String(this.curToken.literal!)
  }

  private parsePrefix(): expr.Prefix | null {
    const opToken = this.curToken
    this.nextToken()

    const right = this.parseExpression(Precedence.Prefix)
    if (!right) {
      return null
    }

    return new expr.Prefix(opToken, right)
  }

  private parseGroupedExpr(): Expr | null {
    this.nextToken()

    const expr = this.parseExpression(Precedence.Lowest)
    if (
      !this.expectPeek(
        TokenType.RParen,
        "expected ')' for the grouped expression",
      )
    ) {
      return null
    }

    return expr
  }

  private parseInfix(left: Expr): expr.Infix | null {
    const opToken = this.curToken
    const precedence = this.curPrecedence()

    this.nextToken()
    const right = this.parseExpression(precedence)
    if (!right) {
      return null
    }

    return new expr.Infix(opToken, left, right)
  }

  private parseIfExpr(): expr.If | null {
    const token = this.curToken

    if (!this.expectPeek(TokenType.LParen, "expected '(' after 'if'")) {
      return null
    }

    this.nextToken()

    const condition = this.parseExpression(Precedence.Lowest)
    if (!condition) {
      return null
    }

    if (
      !this.expectPeek(TokenType.RParen, "expected ')' after 'if condition'")
    ) {
      return null
    }

    if (
      !this.expectPeek(TokenType.LBrace, "expected '{' after 'if condition'")
    ) {
      return null
    }

    const consequence = this.parseBlock()

    let alternative: stmt.Block | undefined
    if (this.peekTokenIs(TokenType.Else)) {
      this.nextToken()
      if (!this.expectPeek(TokenType.LBrace, "expected '{' after 'else'")) {
        return null
      }
      alternative = this.parseBlock()
    }

    return new expr.If(condition, consequence, alternative)
  }

  private parseFnExpr(): expr.Fn | null {
    const fnToken = this.curToken

    if (!this.expectPeek(TokenType.LParen, "expected '(' after 'fn'")) {
      return null
    }

    const params = this.parseFnParams()
    if (!params) {
      return null
    }

    if (
      !this.expectPeek(
        TokenType.LBrace,
        "expected '{' after function parameters",
      )
    ) {
      return null
    }

    const body = this.parseBlock()

    return new expr.Fn(fnToken, params, body)
  }

  private parseFnParams(): expr.Ident[] | null {
    const idents: expr.Ident[] = []

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

    if (
      !this.expectPeek(
        TokenType.RParen,
        "expected ')' after function parameters",
      )
    ) {
      return null
    }

    return idents
  }

  private parseCallExpr(fnExpr: Expr): Expr | null {
    const tok = this.curToken

    const args = this.parseExpressionList(TokenType.RParen)
    if (!args) {
      return null
    }

    return new expr.Call(fnExpr, args)
  }

  private parseArrayLiteral(): expr.Array | null {
    const token = this.curToken

    const elements = this.parseExpressionList(TokenType.RBracket)
    if (!elements) {
      return null
    }

    return new expr.Array(elements)
  }

  private parseExpressionList(end: TokenType): Expr[] | null {
    const expressions: Expr[] = []

    if (this.peekTokenIs(end)) {
      this.nextToken()
      return expressions
    }

    this.nextToken()

    const expr = this.parseExpression(Precedence.Lowest)
    if (!expr) {
      return null
    }

    expressions.push(expr)

    while (this.peekTokenIs(TokenType.Comma)) {
      this.nextToken()
      this.nextToken()
      const expr = this.parseExpression(Precedence.Lowest)
      if (!expr) {
        return null
      }

      expressions.push(expr)
    }

    if (!this.expectPeek(end, `expected '${end}' after list of expressions`)) {
      return null
    }

    return expressions
  }

  private parseIndexExpression(left: Expr): expr.Index | null {
    this.nextToken()
    const index = this.parseExpression(Precedence.Lowest)
    if (!index) {
      return null
    }

    if (
      !this.expectPeek(
        TokenType.RBracket,
        "expected ']' after index expression",
      )
    ) {
      return null
    }

    return new expr.Index(left, index)
  }

  private parseHashMapLiteral(): expr.HashMap | null {
    const keys: Expr[] = []
    const values: Expr[] = []

    while (!this.peekTokenIs(TokenType.RBrace)) {
      this.nextToken()

      const key = this.parseExpression(Precedence.Lowest)
      if (!key) {
        return null
      }

      if (!this.expectPeek(TokenType.Colon, "expected ':' after hashmap key")) {
        return null
      }

      this.nextToken()

      const value = this.parseExpression(Precedence.Lowest)
      if (!value) {
        return null
      }

      if (
        !this.peekTokenIs(TokenType.RBrace) &&
        !this.expectPeek(TokenType.Comma, "expected ',' after value in hashmap")
      ) {
        return null
      }

      keys.push(key)
      values.push(value)
    }

    if (
      !this.expectPeek(TokenType.RBrace, "expected '}' for hashmap literal")
    ) {
      return null
    }

    return new expr.HashMap(keys, values)
  }

  //
  // Util
  //

  private nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.next()
  }

  private curTokenIs(type: TokenType): boolean {
    return this.curToken.type == type
  }

  private peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type == type
  }

  private expectPeek(type: TokenType, message: string): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken()
      return true
    }

    this.report(this.curToken, message)
    return false
  }

  private noPrifixParseFnError() {
    this.report(
      this.curToken,
      `invalid expression for '${this.curToken.literal}'`,
    )
  }

  private peekPrecedence(): Precedence {
    return precedences.get(this.peekToken.type) ?? Precedence.Lowest
  }

  private curPrecedence(): Precedence {
    return precedences.get(this.curToken.type) ?? Precedence.Lowest
  }

  private report(t: Token, message: string) {
    this.errors.push(`[line ${t.line}] error: ${message}`)
  }
}

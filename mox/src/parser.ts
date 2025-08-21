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

  private constructor(lexer: TokenIter) {
    this.lexer = lexer
    this.curToken = new Token(TokenType.EOF, '\0', 0)
    this.peekToken = new Token(TokenType.EOF, '\0', 0)
    this.errors = []

    this.prefixParseFns = new Map([
      [TokenType.IDENT, this.parseIdent.bind(this)],
      [TokenType.INT, this.parseInteger.bind(this)],
      [TokenType.STRING, this.parseString.bind(this)],
      [TokenType.TRUE, this.parseBool.bind(this)],
      [TokenType.FALSE, this.parseBool.bind(this)],
      [TokenType.BANG, this.parsePrefix.bind(this)],
      [TokenType.MINUS, this.parsePrefix.bind(this)],
      [TokenType.LEFT_PAREN, this.parseGroupedExpr.bind(this)],
      [TokenType.IF, this.parseIfExpr.bind(this)],
      [TokenType.FUNC, this.parseFnExpr.bind(this)],
      [TokenType.LEFT_BRACKET, this.parseArrayLiteral.bind(this)],
      [TokenType.LEFT_BRACE, this.parseHashMapLiteral.bind(this)],
    ])

    this.infixParseFns = new Map([
      [TokenType.PLUS, this.parseInfix.bind(this)],
      [TokenType.MINUS, this.parseInfix.bind(this)],
      [TokenType.SLASH, this.parseInfix.bind(this)],
      [TokenType.ASTERISK, this.parseInfix.bind(this)],
      [TokenType.EQUAL, this.parseInfix.bind(this)],
      [TokenType.NOT_EQUAL, this.parseInfix.bind(this)],
      [TokenType.LESS_THAN, this.parseInfix.bind(this)],
      [TokenType.GREATER_THAN, this.parseInfix.bind(this)],
      [TokenType.LEFT_PAREN, this.parseCallExpr.bind(this)],
      [TokenType.LEFT_BRACKET, this.parseIndexExpression.bind(this)],
    ])

    this.nextToken()
    this.nextToken()
  }

  /** parse parses the program and returns AST = Stmt[] */
  parse(): Stmt[] {
    const statements: Stmt[] = []

    while (!this.curTokenIs(TokenType.EOF)) {
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
      case TokenType.PRINT:
        return this.parsePrintStatement()
      default:
        return this.parseExprStmt()
    }
  }

  // "let" <ident> "=" <expr> ";"?
  private parseLetStatement(): stmt.Let | null {
    if (!this.expectPeek(TokenType.IDENT, "expected 'identifier' after 'let'")) {
      return null
    }

    const name = this.parseIdent()

    if (!this.expectPeek(TokenType.ASSIGN, "expected '=' after 'identifier'")) {
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

    return new stmt.Let(name, value)
  }

  // "return" <expr> ";"?
  private parseReturnStatement(): stmt.Return | null {
    const returnToken = this.curToken
    this.nextToken()

    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new stmt.Return(returnToken, value)
  }

  // "print" <expr> ";"?
  private parsePrintStatement(): stmt.Print | null {
    this.nextToken()
    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new stmt.Print(value)
  }

  // <expr> ";"?
  private parseExprStmt(): stmt.Expression | null {
    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new stmt.Expression(value)
  }

  // "{" <statements> "}"
  private parseBlock(): stmt.Block {
    const statements: Stmt[] = []
    this.nextToken()
    while (!this.curTokenIs(TokenType.RIGHT_BRACE) && !this.curTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement()
      if (stmt != null) statements.push(stmt)
      this.nextToken()
    }
    return new stmt.Block(statements)
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
    return new expr.Int(parseInt(this.curToken.literal))
  }

  private parseBool(): expr.Bool {
    return new expr.Bool(this.curToken.literal == 'true' ? true : false)
  }

  private parseString(): expr.String {
    return new expr.String(this.curToken.literal)
  }

  private parsePrefix(): expr.Prefix | null {
    const opToken = this.curToken
    this.nextToken()

    const right = this.parseExpression(Precedence.PREFIX)
    if (!right) {
      return null
    }

    return new expr.Prefix(opToken, right)
  }

  private parseGroupedExpr(): Expr | null {
    this.nextToken() // "("

    const expr = this.parseExpression(Precedence.LOWEST)
    if (!this.expectPeek(TokenType.RIGHT_PAREN, "expected ')' for the grouped expression")) {
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

  // "if" "(" <condition> ")" "{" <consequence> "}" ( else  "{" <alternative> "}" )?
  private parseIfExpr(): expr.If | null {
    const token = this.curToken

    if (!this.expectPeek(TokenType.LEFT_PAREN, "expected '(' after 'if'")) {
      return null
    }

    this.nextToken()

    const condition = this.parseExpression(Precedence.LOWEST)
    if (!condition) {
      return null
    }

    if (!this.expectPeek(TokenType.RIGHT_PAREN, "expected ')' after 'if condition'")) {
      return null
    }

    if (!this.expectPeek(TokenType.LEFT_BRACE, "expected '{' after 'if condition'")) {
      return null
    }

    const consequence = this.parseBlock()

    let alternative: stmt.Block | undefined
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken()
      if (!this.expectPeek(TokenType.LEFT_BRACE, "expected '{' after 'else'")) {
        return null
      }
      alternative = this.parseBlock()
    }

    return new expr.If(condition, consequence, alternative)
  }

  // fn ( <params> ) { <block> }
  private parseFnExpr(): expr.Fn | null {
    const fnToken = this.curToken

    if (!this.expectPeek(TokenType.LEFT_PAREN, "expected '(' after 'fn'")) {
      return null
    }

    const params = this.parseFnParams()
    if (!params) {
      return null
    }

    if (!this.expectPeek(TokenType.LEFT_BRACE, "expected '{' after function parameters")) {
      return null
    }

    const body = this.parseBlock()

    return new expr.Fn(fnToken, params, body)
  }

  // ( <params> )
  private parseFnParams(): expr.Ident[] | null {
    const idents: expr.Ident[] = []

    if (this.peekTokenIs(TokenType.RIGHT_PAREN)) {
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

    if (!this.expectPeek(TokenType.RIGHT_PAREN, "expected ')' after function parameters")) {
      return null
    }

    return idents
  }

  private parseCallExpr(fnExpr: Expr): Expr | null {
    const tok = this.curToken

    const args = this.parseExpressionList(TokenType.RIGHT_PAREN)
    if (!args) {
      return null
    }

    return new expr.Call(fnExpr, args)
  }

  private parseArrayLiteral(): expr.Array | null {
    const token = this.curToken

    const elements = this.parseExpressionList(TokenType.RIGHT_BRACKET)
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

    const expr = this.parseExpression(Precedence.LOWEST)
    if (!expr) {
      return null
    }

    expressions.push(expr)

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      const expr = this.parseExpression(Precedence.LOWEST)
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
    const index = this.parseExpression(Precedence.LOWEST)
    if (!index) {
      return null
    }

    if (!this.expectPeek(TokenType.RIGHT_BRACKET, "expected ']' after index expression")) {
      return null
    }

    return new expr.Index(left, index)
  }

  private parseHashMapLiteral(): expr.HashMap | null {
    const keys: Expr[] = []
    const values: Expr[] = []

    while (!this.peekTokenIs(TokenType.RIGHT_BRACE)) {
      this.nextToken()

      const key = this.parseExpression(Precedence.LOWEST)
      if (!key) {
        return null
      }

      if (!this.expectPeek(TokenType.COLON, "expected ':' after hashmap key")) {
        return null
      }

      this.nextToken()

      const value = this.parseExpression(Precedence.LOWEST)
      if (!value) {
        return null
      }

      if (
        !this.peekTokenIs(TokenType.RIGHT_BRACE) &&
        !this.expectPeek(TokenType.COMMA, "expected ',' after value in hashmap")
      ) {
        return null
      }

      keys.push(key)
      values.push(value)
    }

    if (!this.expectPeek(TokenType.RIGHT_BRACE, "expected '}' for hashmap literal")) {
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

  /** if peek token is a match it calls nextToken() */
  private expectPeek(type: TokenType, message: string): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken()
      return true
    }

    this.report(this.curToken, message)
    return false
  }

  private noPrifixParseFnError() {
    this.report(this.curToken, `invalid expression for '${this.curToken.literal}'`)
  }

  private peekPrecedence(): Precedence {
    return precedences.get(this.peekToken.type) ?? Precedence.LOWEST
  }

  private curPrecedence(): Precedence {
    return precedences.get(this.curToken.type) ?? Precedence.LOWEST
  }

  private report(t: Token, message: string) {
    this.errors.push(`[line ${t.line}] error: ${message}`)
  }
}

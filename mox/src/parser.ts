import * as expr from './ast/expr'
import * as stmt from './ast/stmt'

import { Lexer } from './lexer'
import { Token, TokenType } from './token'
import { Precedence, precedences } from './precedence'

type Stmt = stmt.Stmt
type Expr = expr.Expr

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
      [TokenType.STRING, this.parseString.bind(this)],
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

  parse(): stmt.Program {
    const statements: stmt.Stmt[] = []

    while (this.curToken.type != TokenType.EOF) {
      const stmt = this.parseStatement()
      if (stmt) {
        statements.push(stmt)
      }
      this.nextToken()
    }

    return stmt.Program.new(statements)
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

    return stmt.Let.new(letToken, ident, value)
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

    return stmt.Return.new(returnToken, value)
  }

  // "print" <expr> ";"?
  private parsePrintStatement(): stmt.Print | null {
    const printTok = this.curToken
    this.nextToken()
    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return stmt.Print.new(printTok, value)
  }

  // <expr> ";"?
  private parseExprStmt(): stmt.Expr | null {
    const tok = this.curToken

    const value = this.parseExpression(Precedence.LOWEST)
    if (!value) {
      return null
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return stmt.Expr.new(tok, value)
  }

  // "{" <statements> "}"
  private parseBlock(): stmt.Block {
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

    // TODO: handle EOF

    return stmt.Block.new(tok, stmts)
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
    return expr.Ident.new(this.curToken, this.curToken.literal)
  }

  private parseInteger(): expr.Int {
    return expr.Int.new(this.curToken, parseInt(this.curToken.literal))
  }

  private parseBool(): expr.Bool {
    return expr.Bool.new(this.curToken, this.curToken.literal == 'true' ? true : false)
  }

  private parseString(): expr.String {
    return expr.String.new(this.curToken, this.curToken.literal)
  }

  private parsePrefix(): expr.Prefix | null {
    const opToken = this.curToken
    this.nextToken()

    const right = this.parseExpression(Precedence.PREFIX)
    if (!right) {
      return null
    }

    return expr.Prefix.new(opToken, opToken.literal, right!)
  }

  private parseGroupedExpr(): Expr | null {
    this.nextToken() // "("

    const expr = this.parseExpression(Precedence.LOWEST)
    if (!this.expectPeek(TokenType.RPAREN)) {
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

    return expr.Infix.new(opToken, opToken.literal, left, right)
  }

  // "if" "(" <condition> ")" "{" <consequence> "}" ( else  "{" <alternative> "}" )?
  private parseIfExpr(): expr.If | null {
    const token = this.curToken

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null
    }

    this.nextToken()

    const condition = this.parseExpression(Precedence.LOWEST)
    if (!condition) {
      return null
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null
    }

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null
    }

    const consequence = this.parseBlock()

    let alternative: stmt.Block | null = null
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken()
      if (!this.expectPeek(TokenType.LBRACE)) {
        return null
      }
      alternative = this.parseBlock()
    }

    return expr.If.new(token, condition, consequence, alternative)
  }

  // fn ( <params> ) { <block> }
  private parseFnExpr(): expr.Func | null {
    const fnToken = this.curToken

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null
    }

    const params = this.parseFnParams()
    if (!params) {
      return null
    }

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null
    }

    const body = this.parseBlock()

    return expr.Func.new(fnToken, params, body)
  }

  // ( <params> )
  private parseFnParams(): expr.Ident[] | null {
    const idents: expr.Ident[] = []

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

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null
    }

    return idents
  }

  // <fn_lit> | <ident> (<args>)
  private parseCallExpr(fnExpr: Expr): Expr | null {
    const tok = this.curToken

    const args = this.parseCallArgs()
    if (!args) {
      return null
    }

    return expr.Call.new(tok, fnExpr, args)
  }

  // ( <args> )
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

    if (!this.expectPeek(TokenType.RPAREN)) {
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

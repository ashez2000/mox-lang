import {
  Block,
  Bool,
  Call,
  Expr,
  Expression,
  Fn,
  Identifier,
  If,
  Infix,
  Integer,
  Let,
  Prefix,
  Return,
  Stmt,
} from './ast'

import { Lexer } from './lexer'
import { Token, TokenType } from './token'
import { PrecedenceLevel, precedences } from './precedence'

type PrefixParseFn = () => Expr | null
type InfixParseFn = (left: Expr) => Expr

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
      [TokenType.IDENT, this.parseIdentifier.bind(this)],
      [TokenType.INT, this.parseInteger.bind(this)],
      [TokenType.TRUE, this.parseBool.bind(this)],
      [TokenType.FALSE, this.parseBool.bind(this)],
      [TokenType.BANG, this.parsePrefixExpression.bind(this)],
      [TokenType.MINUS, this.parsePrefixExpression.bind(this)],
      [TokenType.LPAREN, this.parseGroupedExpression.bind(this)],
      [TokenType.IF, this.parseIfExpression.bind(this)],
      [TokenType.FUNCTION, this.parseFn.bind(this)],
    ])

    this.infixParseFns = new Map([
      [TokenType.PLUS, this.parseInfixExpression.bind(this)],
      [TokenType.MINUS, this.parseInfixExpression.bind(this)],
      [TokenType.SLASH, this.parseInfixExpression.bind(this)],
      [TokenType.ASTERISK, this.parseInfixExpression.bind(this)],
      [TokenType.EQ, this.parseInfixExpression.bind(this)],
      [TokenType.NE, this.parseInfixExpression.bind(this)],
      [TokenType.LT, this.parseInfixExpression.bind(this)],
      [TokenType.GT, this.parseInfixExpression.bind(this)],
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
        return this.parseExpressionStatement()
    }
  }

  // let <ident> = <expr>;
  private parseLetStatement(): Stmt | null {
    const letToken = this.curToken

    if (!this.expectPeek(TokenType.IDENT)) {
      return null
    }

    const ident = new Identifier(this.curToken, this.curToken.literal)

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null
    }

    // skipping expression
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new Let(letToken, ident, {} as any)
  }

  // return <expr>;
  private parseReturnStatement(): Stmt | null {
    const returnToken = this.curToken
    this.nextToken()

    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return new Return(returnToken, {} as any)
  }

  // <expr>;
  private parseExpressionStatement(): Stmt | null {
    const expr = this.parseExpression(PrecedenceLevel.LOWEST)

    // optional semicolon after expression
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    // TODO: how to deal with there null cases ???
    return new Expression(expr!)
  }

  //
  // Expr
  //

  // core logic of Pratt Parser aka (Top Down Operator Precedence Parser)
  private parseExpression(precedence: PrecedenceLevel): Expr | null {
    // curToken points to start of expression
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

  private parseIdentifier(): Identifier {
    return new Identifier(this.curToken, this.curToken.literal)
  }

  private parseInteger(): Expr {
    // TODO: handle parseInt error
    return new Integer(this.curToken, parseInt(this.curToken.literal))
  }

  private parseBool(): Expr {
    const value = this.curToken.literal == 'true' ? true : false
    return new Bool(this.curToken, value)
  }

  private parsePrefixExpression(): Expr {
    // curToken points to prefix operator
    const operatorToken = this.curToken
    this.nextToken()

    // TODO: handle null case
    const right = this.parseExpression(PrecedenceLevel.PREFIX)
    return new Prefix(operatorToken, operatorToken.literal, right!)
  }

  private parseGroupedExpression(): Expr | null {
    this.nextToken()
    const expr = this.parseExpression(PrecedenceLevel.LOWEST)
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null
    }
    return expr
  }

  private parseInfixExpression(left: Expr): Expr {
    // curToken points to infix operator
    const operatorToken = this.curToken
    const precedence = this.curPrecedence()

    this.nextToken()
    const right = this.parseExpression(precedence)

    return new Infix(operatorToken, operatorToken.literal, left, right!)
  }

  private parseBlock(): Block {
    const stmts: Stmt[] = []

    this.nextToken()

    while (!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement()
      if (stmt != null) {
        stmts.push(stmt)
      }
      this.nextToken()
    }

    return new Block(stmts)
  }

  private parseIfExpression(): Expr | null {
    const ifToken = this.curToken

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null
    }

    this.nextToken()

    const cond = this.parseExpression(PrecedenceLevel.LOWEST)

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null
    }

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null
    }

    const thenBlock = this.parseBlock()
    let elseBlock: Block | null = null

    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken()
      if (!this.expectPeek(TokenType.LBRACE)) {
        return null
      }
      elseBlock = this.parseBlock()
    }

    // TODO: nulls
    return new If(ifToken, cond!, thenBlock, elseBlock)
  }

  private parseFn(): Expr | null {
    const fnToken = this.curToken

    if (!this.peekTokenIs(TokenType.LPAREN)) {
      return null
    }

    const params = this.parseFnParams()

    if (!this.peekTokenIs(TokenType.LBRACE)) {
      return null
    }

    const body = this.parseBlock()

    return new Fn(fnToken, params as any, body)
  }

  private parseFnParams(): Identifier[] | null {
    const idents: Identifier[] = []

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken()
      return idents
    }

    this.nextToken()

    const ident = this.parseIdentifier()
    idents.push(ident)

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      const ident = this.parseIdentifier()
      idents.push(ident)
    }

    if (!this.peekTokenIs(TokenType.LBRACE)) {
      return null
    }

    return idents
  }

  private parseCallExpr(fnExpr: Expr): Expr {
    const tok = this.curToken
    const args = this.parseCallArgs()
    return new Call(tok, fnExpr, args)
  }

  private parseCallArgs(): Expr[] {
    const args: Expr[] = []

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken()
      return args
    }

    // null case
    this.nextToken()
    args.push(this.parseExpression(PrecedenceLevel.LOWEST)!)

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      args.push(this.parseExpression(PrecedenceLevel.LOWEST)!)
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

  private expectPeek(type: TokenType): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken()
      return true
    }
    this.errors.push(`[line ${this.peekToken.line}]: Expected peek token to be ${type}, got ${this.peekToken.type}`)
    return false
  }

  private noPrifixParseFnError() {
    this.errors.push(`[line ${this.curToken.line}]: No prefix parse fn found for ${this.curToken.type}`)
  }

  private peekPrecedence(): PrecedenceLevel {
    return precedences.get(this.peekToken.type) ?? PrecedenceLevel.LOWEST
  }

  private curPrecedence(): PrecedenceLevel {
    return precedences.get(this.curToken.type) ?? PrecedenceLevel.LOWEST
  }
}

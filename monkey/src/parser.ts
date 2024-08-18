import { Expr, Expression, Identifier, Integer, Let, Prefix, Return, Stmt } from './ast'
import { Lexer } from './lexer'
import { Token, TokenType } from './token'

type PrefixParseFn = () => Expr
type InfixParseFn = (left: Expr) => Expr

export class Parser {
  private lexer: Lexer
  private curToken: Token
  private peekToken: Token
  private prefixParseFns: Map<TokenType, PrefixParseFn>
  private infixParseFns: Map<TokenType, InfixParseFn>

  private constructor(lexer: Lexer) {
    this.lexer = lexer
    this.curToken = Token.new(TokenType.EOF, '\0')
    this.peekToken = Token.new(TokenType.EOF, '\0')

    this.prefixParseFns = new Map([
      [TokenType.IDENT, this.parseIdentifier.bind(this)],
      [TokenType.INT, this.parseInteger.bind(this)],
      [TokenType.BANG, this.parsePrefixExpression.bind(this)],
      [TokenType.MINUS, this.parsePrefixExpression.bind(this)],
    ])

    this.infixParseFns = new Map()
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
    const expr = this.parseExpression()

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    // TODO: how to deal with there null cases ???
    return new Expression(expr!)
  }

  //
  // Expr
  //

  // TODO: deal with this null case
  private parseExpression(): Expr | null {
    const prefix = this.prefixParseFns.get(this.curToken.type)
    if (!prefix) {
      return null
    }

    const leftExpr = prefix()
    return leftExpr
  }

  private parseIdentifier(): Expr {
    return new Identifier(this.curToken, this.curToken.literal)
  }

  private parseInteger(): Expr {
    // TODO: handle parseInt error
    return new Integer(this.curToken, parseInt(this.curToken.literal))
  }

  private parsePrefixExpression(): Expr {
    const operatorToken = this.curToken
    this.nextToken()

    // TODO: handle null case
    const right = this.parseExpression()
    return new Prefix(operatorToken, operatorToken.literal, right!)
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
    return false
  }
}

import { Identifier, Let, Return, Stmt } from './ast'
import { Lexer } from './lexer'
import { Token, TokenType } from './token'

export class Parser {
  private lexer: Lexer
  private curToken: Token
  private peekToken: Token

  private constructor(lexer: Lexer) {
    this.lexer = lexer
    this.curToken = Token.new(TokenType.EOF, '\0')
    this.peekToken = Token.new(TokenType.EOF, '\0')
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

  private parseStatement(): Stmt | null {
    switch (this.curToken.type) {
      case TokenType.LET:
        return this.parseLetStatement()
      case TokenType.RETURN:
        return this.parseReturnStatement()
      default:
        return null
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

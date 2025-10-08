import { Ident, Let, Program, Statement } from './ast.js'
import { TokenIter } from './lexer.js'
import { Token, TokenType } from './token.js'

export class Parser {
  private curToken: Token
  private peekToken: Token
  private errors: string[] = []

  constructor(private lexer: TokenIter) {
    this.curToken = lexer.next()
    this.peekToken = lexer.next()
  }

  public parseProgram(): Program {
    let statements: Statement[] = []

    while (this.curToken.type != TokenType.Eof) {
      let statement = this.parseStatement()
      if (statement != null) {
        statements.push(statement)
      }
      this.nextToken()
    }

    return new Program(statements)
  }

  public getErrors(): readonly string[] {
    return this.errors
  }

  private parseStatement(): Optional<Statement> {
    switch (this.curToken.type) {
      case TokenType.Let:
        return this.parseLetStatement()
      default:
        return null
    }
  }

  private parseLetStatement(): Optional<Let> {
    if (!this.expectPeek(TokenType.Ident, 'Expected an idenfitier after let')) {
      return null
    }

    let name = new Ident(this.curToken)

    // TODO: Is assignment required
    if (!this.expectPeek(TokenType.Assign, "Expected '=' after identifier")) {
      return null
    }

    while (!this.curTokenIs(TokenType.Semicolon)) {
      this.nextToken()
    }

    return new Let(name)
  }

  // ### Helpers ###

  private nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.next()
  }

  private curTokenIs(t: TokenType) {
    return this.curToken.type == t
  }

  private peekTokenIs(t: TokenType) {
    return this.peekToken.type == t
  }

  private expectPeek(t: TokenType, message: string) {
    if (this.peekTokenIs(t)) {
      this.nextToken()
      return true
    } else {
      this.peekError(message)
      return false
    }
  }

  private peekError(message: string) {
    this.errors.push(`Error: ${message}, Ln: ${this.curToken.line}`)
  }
}

/** I mean its not an actial Optional Type, but the function signature looks kinda nice */
type Optional<T> = T | null

import { Token, TokenType } from './token-v2.js'

export class Lexer {
  private input: string
  private tokens: Token[] = []

  private start: number = 0
  private current: number = 0
  private line: number = 1

  public errors: string[] = []

  constructor(input: string) {
    this.input = input
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TokenType.Eof, '\0', this.line))
    return this.tokens
  }

  private scanToken(): void {
    let c = this.advance()
    switch (c) {
      case '(':
        this.addToken(TokenType.LParen)
        break
      case ')':
        this.addToken(TokenType.RParen)
        break
      case '{':
        this.addToken(TokenType.LBrace)
        break
      case '}':
        this.addToken(TokenType.RBrace)
        break
      case ',':
        this.addToken(TokenType.Comma)
        break
      case '-':
        this.addToken(TokenType.Minus)
        break
      case '+':
        this.addToken(TokenType.Plus)
        break
      case ';':
        this.addToken(TokenType.Semicolon)
        break
      case '*':
        this.addToken(TokenType.Asterisk)
        break

      case '!':
        this.addToken(this.match('=') ? TokenType.NotEq : TokenType.Bang)
        break

      case '=':
        this.addToken(this.match('=') ? TokenType.Eq : TokenType.Assign)
        break

      case '/':
        if (this.match('/')) {
          while (this.peek() != '\n' && !this.isAtEnd()) this.advance
        } else {
          this.addToken(TokenType.Slash)
        }
        break

      case ' ':
      case '\r':
      case '\t':
        break

      case '\n':
        this.line++
        break

      case '"':
        this.scanString()
        break

      default:
        if (isDigit(c)) {
          this.scanNumber()
        } else if (isAlpha(c)) {
          this.scanIdent()
        } else {
          this.errors.push(`[line ${this.line}] Unexpected character '${c}'`)
        }
    }
  }

  private scanIdent(): void {
    while (isAlphaNumeric(this.peek())) this.advance()
    let literal = this.input.slice(this.start, this.current)
    let tt = Token.lookupIdent(literal)
    this.addToken(tt)
  }

  private scanNumber(): void {
    while (isDigit(this.peek())) this.advance()
    this.addToken(TokenType.Int)
  }

  private scanString(): void {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') this.line++
      this.advance()
    }

    if (this.isAtEnd()) {
      this.errors.push(`[line ${this.line}] Unterminated string`)
    }

    this.advance()
    this.addToken(TokenType.String)
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false
    }

    if (this.input[this.current] != expected) {
      return false
    }

    this.current++
    return true
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return '\0'
    }
    return this.input[this.current]
  }

  private isAtEnd(): boolean {
    return this.current >= this.input.length
  }

  /** advance moves the current pointer and returns consumed char*/
  private advance(): string {
    return this.input[this.current++]
  }

  private addToken(type: TokenType): void {
    let literal = this.input.slice(this.start, this.current)
    this.tokens.push(new Token(type, literal, this.line))
  }
}

function isAlphaNumeric(c: string): boolean {
  return isAlpha(c) || isDigit(c)
}

function isAlpha(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
}

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

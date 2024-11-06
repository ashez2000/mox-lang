import { Token, TokenType } from './token.js'
import { formattedError } from './error.js'

export class Lexer {
  private source: string
  private tokens: Token[]
  private start: number
  private current: number
  private line: number
  private errors: string[]

  constructor(source: string) {
    this.source = source
    this.tokens = []
    this.start = 0
    this.current = 0
    this.line = 1
    this.errors = []
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TokenType.EOF, '\0', this.line))
    return this.tokens
  }

  getErrors() {
    return this.errors
  }

  private scanToken() {
    const c = this.advance()

    switch (c) {
      case '(':
        this.addToken(TokenType.LPAREN)
        break

      case ')':
        this.addToken(TokenType.RPAREN)
        break

      case '{':
        this.addToken(TokenType.LBRACE)
        break

      case '}':
        this.addToken(TokenType.RBRACE)
        break

      case '[':
        this.addToken(TokenType.LBRACKET)
        break

      case ']':
        this.addToken(TokenType.RBRACKET)
        break

      case ',':
        this.addToken(TokenType.COMMA)
        break

      case '-':
        this.addToken(TokenType.MINUS)
        break

      case '+':
        this.addToken(TokenType.PLUS)
        break

      case ';':
        this.addToken(TokenType.SEMICOLON)
        break

      case '*':
        this.addToken(TokenType.ASTERISK)
        break

      case ':':
        this.addToken(TokenType.COLON)
        break

      case '!':
        this.addToken(this.match('=') ? TokenType.NOT_EQUAL : TokenType.BANG)
        break

      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL : TokenType.ASSIGN)
        break

      case '<':
        this.addToken(TokenType.LT)
        break

      case '>':
        this.addToken(TokenType.GT)
        break

      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance()
          }
        } else {
          this.addToken(TokenType.SLASH)
        }

      case ' ':
      case '\t':
      case '\r':
        break

      case '\n':
        this.line++
        break

      case '"':
        this.string()
        break

      default:
        if (isDigit(c)) {
          this.number()
        } else if (isAlpha(c)) {
          this.identifier()
        } else {
          this.errors.push(formattedError(this.line, `Unexpected character '${c}'`))
        }
    }
  }

  private identifier() {
    while (isAlphaNumeric(this.peek())) this.advance()
    const lexeme = this.source.slice(this.start, this.current)
    this.addToken(keywords.get(lexeme) ?? TokenType.IDENT)
  }

  private number() {
    while (isDigit(this.peek())) this.advance()
    this.addTokenLiteral(TokenType.INT)
  }

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') this.line++
      this.advance()
    }

    if (this.isAtEnd()) {
      this.errors.push(formattedError(this.line, 'Unterminated string'))
    }

    this.advance()

    this.addTokenLiteral(TokenType.STRING)
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false
    if (this.source[this.current] !== expected) return false

    this.current++
    return true
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0'
    return this.source[this.current]
  }

  private advance(): string {
    return this.source[this.current++]
  }

  private addToken(type: TokenType) {
    this.addTokenLiteral(type)
  }

  private addTokenLiteral(type: TokenType) {
    const literal = this.source.substring(this.start, this.current)
    this.tokens.push(new Token(type, literal, this.line))
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length
  }
}

/** Helper class to consume tokens */
export class TokenIter {
  private tokens: Token[]
  private cur: number

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.cur = 0
  }

  /**
   * Returns next token from provied token array
   *
   * Once EOF is reached subsequent calls will return EOF token
   */
  next(): Token {
    if (this.cur >= this.tokens.length) return this.tokens[this.cur - 1]
    return this.tokens[this.cur++]
  }
}

export function buildLexer(input: string) {
  const lexer = new Lexer(input)
  const tokens = lexer.scanTokens()
  const errors = lexer.getErrors()
  const tokenIter = new TokenIter(tokens)

  return { tokenIter, errors }
}

const keywords = new Map<string, TokenType>([
  ['fn', TokenType.FUNCTION],
  ['let', TokenType.LET],
  ['true', TokenType.TRUE],
  ['false', TokenType.FALSE],
  ['if', TokenType.IF],
  ['else', TokenType.ELSE],
  ['return', TokenType.RETURN],
  ['print', TokenType.PRINT],
])

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

function isAlpha(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
}

function isAlphaNumeric(c: string): boolean {
  return isDigit(c) || isAlpha(c)
}

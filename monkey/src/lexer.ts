import { TokenType, Token } from './token.js'

export class Lexer {
  private input: string
  private position: number
  private readPosition: number
  private ch: string

  constructor(input: string) {
    this.input = input
    this.position = 0
    this.readPosition = 0
    this.ch = '\0'
  }

  static new(input: string): Lexer {
    const lexer = new Lexer(input)
    lexer.readChar()
    return lexer
  }

  nextToken(): Token {
    let tok = Token.new(TokenType.EOF, '\0')

    this.skipWhitespace()

    switch (this.ch) {
      case '=':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = Token.new(TokenType.EQ, '==')
        } else {
          tok = Token.new(TokenType.ASSIGN, this.ch)
        }
        break
      case '!':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = Token.new(TokenType.NE, '!=')
        } else {
          tok = Token.new(TokenType.BANG, this.ch)
        }
        break
      case ';':
        tok = Token.new(TokenType.SEMICOLON, this.ch)
        break
      case '(':
        tok = Token.new(TokenType.LPAREN, this.ch)
        break
      case ')':
        tok = Token.new(TokenType.RPAREN, this.ch)
        break
      case '{':
        tok = Token.new(TokenType.LBRACE, this.ch)
        break
      case '}':
        tok = Token.new(TokenType.RBRACE, this.ch)
        break
      case ',':
        tok = Token.new(TokenType.COMMA, this.ch)
        break
      case '+':
        tok = Token.new(TokenType.PLUS, this.ch)
        break
      case '-':
        tok = Token.new(TokenType.MINUS, this.ch)
        break
      case '*':
        tok = Token.new(TokenType.ASTERISK, this.ch)
        break
      case '<':
        tok = Token.new(TokenType.LT, this.ch)
        break
      case '>':
        tok = Token.new(TokenType.GT, this.ch)
        break
      case '/':
        tok = Token.new(TokenType.SLASH, this.ch)
        break
      case '\0':
        tok = Token.new(TokenType.EOF, this.ch)
        break

      default:
        if (isLetter(this.ch)) {
          tok.literal = this.readIdentifier()
          tok.type = keywords.get(tok.literal) ?? TokenType.IDENT
          return tok
        } else if (isDigit(this.ch)) {
          tok.literal = this.readNumber()
          tok.type = TokenType.INT
          return tok
        } else {
          tok = Token.new(TokenType.ILLEGAL, this.ch)
        }
    }

    this.readChar()
    return tok
  }

  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = '\0'
    } else {
      this.ch = this.input[this.readPosition]
    }

    this.position = this.readPosition
    this.readPosition += 1
  }

  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return '\0'
    }
    return this.input[this.readPosition]
  }

  private readIdentifier(): string {
    const position = this.position
    while (isLetter(this.ch)) {
      this.readChar()
    }
    return this.input.slice(position, this.position)
  }

  private readNumber(): string {
    const position = this.position
    while (isDigit(this.ch)) {
      this.readChar()
    }
    return this.input.slice(position, this.position)
  }

  private skipWhitespace() {
    while (
      this.ch == ' ' ||
      this.ch == '\n' ||
      this.ch == '\t' ||
      this.ch == '\r'
    ) {
      this.readChar()
    }
  }
}

const keywords = new Map<string, TokenType>([
  ['fn', TokenType.FUNCTION],
  ['let', TokenType.LET],
  ['true', TokenType.TRUE],
  ['false', TokenType.FALSE],
  ['if', TokenType.IF],
  ['else', TokenType.ELSE],
  ['return', TokenType.RETURN],
])

function isLetter(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_'
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

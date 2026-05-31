import { TokenType, Token } from './token.js'

export class Lexer {
  private input: string
  private position: number
  private readPosition: number
  private ch: string
  private line: number

  constructor(input: string) {
    this.input = input
    this.position = 0
    this.readPosition = 0
    this.ch = '\0'
    this.line = 1

    this.nextToken()
  }

  nextToken(): Token {
    let tok = new Token(TokenType.Eof, '\0', this.line)

    this.skipWhitespace()

    switch (this.ch) {
      case '=':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = new Token(TokenType.Eq, '==', this.line)
        } else {
          tok = new Token(TokenType.Assign, this.ch, this.line)
        }
        break
      case '!':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = new Token(TokenType.NotEq, '!=', this.line)
        } else {
          tok = new Token(TokenType.Bang, this.ch, this.line)
        }
        break
      case ';':
        tok = new Token(TokenType.Semicolon, this.ch, this.line)
        break
      case ':':
        tok = new Token(TokenType.Colon, this.ch, this.line)
        break
      case '(':
        tok = new Token(TokenType.LParen, this.ch, this.line)
        break
      case ')':
        tok = new Token(TokenType.RParen, this.ch, this.line)
        break
      case '{':
        tok = new Token(TokenType.LBrace, this.ch, this.line)
        break
      case '}':
        tok = new Token(TokenType.RBrace, this.ch, this.line)
        break
      case '[':
        tok = new Token(TokenType.LBracket, this.ch, this.line)
        break
      case ']':
        tok = new Token(TokenType.RBracket, this.ch, this.line)
        break
      case ',':
        tok = new Token(TokenType.Comma, this.ch, this.line)
        break
      case '+':
        tok = new Token(TokenType.Plus, this.ch, this.line)
        break
      case '-':
        tok = new Token(TokenType.Minus, this.ch, this.line)
        break
      case '*':
        tok = new Token(TokenType.Asterisk, this.ch, this.line)
        break
      case '<':
        tok = new Token(TokenType.Lt, this.ch, this.line)
        break
      case '>':
        tok = new Token(TokenType.Gt, this.ch, this.line)
        break
      case '/':
        tok = new Token(TokenType.Slash, this.ch, this.line)
        break

      case '"': // TODO: looks funny (line)
        tok = new Token(TokenType.String, this.readString(), this.line)
        break

      case '\0':
        tok = new Token(TokenType.Eof, this.ch, this.line)
        break

      default:
        if (isLetter(this.ch)) {
          tok.literal = this.readIdentifier()
          tok.type = keywords.get(tok.literal) ?? TokenType.Ident
          return tok
        } else if (isDigit(this.ch)) {
          tok.literal = this.readNumber()
          tok.type = TokenType.Int
          return tok
        } else {
          tok = new Token(TokenType.Illegal, this.ch, this.line)
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

  private readString() {
    this.readChar()
    const position = this.position

    while (this.ch != '"' && this.ch != '\0') {
      this.readChar()
    }

    return this.input.slice(position, this.position)
  }

  private skipWhitespace() {
    while (this.ch == ' ' || this.ch == '\n' || this.ch == '\t' || this.ch == '\r') {
      if (this.ch == '\n') {
        this.line += 1
      }

      this.readChar()
    }
  }
}

const keywords = new Map<string, TokenType>([
  ['fn', TokenType.Function],
  ['let', TokenType.Let],
  ['true', TokenType.True],
  ['false', TokenType.False],
  ['if', TokenType.If],
  ['else', TokenType.Else],
  ['return', TokenType.Return],
  ['print', TokenType.Print],
])

function isLetter(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_'
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

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
  }

  static new(input: string): Lexer {
    const lexer = new Lexer(input)
    lexer.readChar()
    return lexer
  }

  nextToken(): Token {
    let tok = Token.new(TokenType.EOF, '\0', this.line)

    this.skipWhitespace()

    switch (this.ch) {
      case '=':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = Token.new(TokenType.EQ, '==', this.line)
        } else {
          tok = Token.new(TokenType.ASSIGN, this.ch, this.line)
        }
        break
      case '!':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = Token.new(TokenType.NE, '!=', this.line)
        } else {
          tok = Token.new(TokenType.BANG, this.ch, this.line)
        }
        break
      case ';':
        tok = Token.new(TokenType.SEMICOLON, this.ch, this.line)
        break
      case ':':
        tok = Token.new(TokenType.COLON, this.ch, this.line)
        break
      case '(':
        tok = Token.new(TokenType.LPAREN, this.ch, this.line)
        break
      case ')':
        tok = Token.new(TokenType.RPAREN, this.ch, this.line)
        break
      case '{':
        tok = Token.new(TokenType.LBRACE, this.ch, this.line)
        break
      case '}':
        tok = Token.new(TokenType.RBRACE, this.ch, this.line)
        break
      case '[':
        tok = Token.new(TokenType.LBRACKET, this.ch, this.line)
        break
      case ']':
        tok = Token.new(TokenType.RBRACKET, this.ch, this.line)
        break
      case ',':
        tok = Token.new(TokenType.COMMA, this.ch, this.line)
        break
      case '+':
        tok = Token.new(TokenType.PLUS, this.ch, this.line)
        break
      case '-':
        tok = Token.new(TokenType.MINUS, this.ch, this.line)
        break
      case '*':
        tok = Token.new(TokenType.ASTERISK, this.ch, this.line)
        break
      case '<':
        tok = Token.new(TokenType.LT, this.ch, this.line)
        break
      case '>':
        tok = Token.new(TokenType.GT, this.ch, this.line)
        break
      case '/':
        tok = Token.new(TokenType.SLASH, this.ch, this.line)
        break

      case '"': // TODO: looks funny (line)
        tok = Token.new(TokenType.STRING, this.readString(), this.line)
        break

      case '\0':
        tok = Token.new(TokenType.EOF, this.ch, this.line)
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
          tok = Token.new(TokenType.ILLEGAL, this.ch, this.line)
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
  ['fn', TokenType.FUNCTION],
  ['let', TokenType.LET],
  ['true', TokenType.TRUE],
  ['false', TokenType.FALSE],
  ['if', TokenType.IF],
  ['else', TokenType.ELSE],
  ['return', TokenType.RETURN],
  ['print', TokenType.PRINT],
])

function isLetter(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_'
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

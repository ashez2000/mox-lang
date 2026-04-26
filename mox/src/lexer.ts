import { Token, TokenType, keywords } from './token.js'

export class Lexer {
  private input: string

  private curPos: number = 0
  private peekPos: number = 0
  private line: number = 1
  private ch: string = '\0'

  constructor(input: string) {
    this.input = input
    this.readChar()
  }

  nextToken(): Token {
    let tok: Token

    this.skipWhitespace()

    switch (this.ch) {
      case '=':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = this.createToken(TokenType.Eq)
        } else {
          tok = this.createToken(TokenType.Assign)
        }
        break

      case '+':
        tok = this.createToken(TokenType.Plus)
        break

      case '-':
        tok = this.createToken(TokenType.Minus)
        break

      case '!':
        if (this.peekChar() == '=') {
          this.readChar()
          tok = this.createToken(TokenType.NotEq)
        } else {
          tok = this.createToken(TokenType.Bang)
        }
        break

      case '/':
        tok = this.createToken(TokenType.Slash)
        break

      case '*':
        tok = this.createToken(TokenType.Asterisk)
        break

      case '<':
        tok = this.createToken(TokenType.Lt)
        break

      case '>':
        tok = this.createToken(TokenType.Gt)
        break

      case ';':
        tok = this.createToken(TokenType.Semicolon)
        break

      case ':':
        tok = this.createToken(TokenType.Colon)
        break

      case ',':
        tok = this.createToken(TokenType.Comma)
        break

      case '{':
        tok = this.createToken(TokenType.LBrace)
        break

      case '}':
        tok = this.createToken(TokenType.RBrace)
        break

      case '(':
        tok = this.createToken(TokenType.LParen)
        break

      case ')':
        tok = this.createToken(TokenType.RParen)
        break

      case '"':
        let literal = this.readString()
        tok = this.createToken(TokenType.String, literal)
        break

      case '[':
        tok = this.createToken(TokenType.LBracket)
        break

      case ']':
        tok = this.createToken(TokenType.RBracket)
        break

      case '\0':
        tok = this.createToken(TokenType.Eof)
        break

      default:
        if (isLetter(this.ch)) {
          let literal = this.readIdentifier()
          let type = keywords.get(literal) ?? TokenType.Ident
          tok = this.createToken(type, literal)
          return tok
        } else if (isDigit(this.ch)) {
          let literal = this.readNumber()
          tok = this.createToken(TokenType.Int, literal)
          return tok
        } else {
          tok = this.createToken(TokenType.Illegal, this.ch)
        }
    }

    this.readChar()

    return tok
  }

  private skipWhitespace(): void {
    while (isWhitespace(this.ch)) {
      this.readChar()
    }
  }

  private readChar(): void {
    if (this.isAtEnd()) {
      this.ch = '\0'
    } else {
      this.ch = this.input[this.peekPos]
    }

    if (this.ch == '\n') {
      this.line += 1
    }

    this.curPos = this.peekPos
    this.peekPos += 1
  }

  private peekChar(): string {
    return this.isAtEnd() ? '\0' : this.input[this.peekPos]
  }

  private readIdentifier(): string {
    let start = this.curPos
    while (isLetter(this.ch)) {
      this.readChar()
    }
    return this.input.slice(start, this.curPos)
  }

  private readNumber(): string {
    let start = this.curPos
    while (isDigit(this.ch)) {
      this.readChar()
    }
    return this.input.slice(start, this.curPos)
  }

  private readString(): string {
    let start = this.curPos + 1
    while (true) {
      this.readChar()
      if (this.ch == '"' || this.ch == '\0') {
        break
      }
    }
    return this.input.slice(start, this.curPos)
  }

  private isAtEnd(): boolean {
    return this.peekPos >= this.input.length
  }

  private createToken(type: TokenType, literal?: string): Token {
    return new Token(type, this.line, literal)
  }
}

function isLetter(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_'
}

function isDigit(ch: string): boolean {
  return '0' <= ch && ch <= '9'
}

function isWhitespace(ch: string): boolean {
  return ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r'
}

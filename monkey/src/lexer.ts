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

    switch (this.ch) {
      case '=':
        tok = Token.new(TokenType.ASSIGN, this.ch)
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

      case '\0':
        tok = Token.new(TokenType.EOF, this.ch)
        break
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
}

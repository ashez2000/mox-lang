import * as token from './token.js'

class Lexer {
  constructor(input = '', position = 0, readPosition = 0, ch = '') {
    this.input = input
    this.position = position
    this.readPosition = readPosition
    this.ch = ch
  }
}

export function New(input) {
  let l = new Lexer(input)
  readChar(l)
  return l
}

export function NextToken(l) {
  let tok = new token.Token()

  skipWhitespace(l)

  switch (l.ch) {
    case '=':
      if (peekChar(l) == '=') {
        let ch = l.ch
        readChar(l)
        let literal = ch + l.ch
        tok = new token.Token(token.EQ, literal)
      } else {
        tok = newToken(token.ASSIGN, l.ch)
      }
      break

    case '+':
      tok = newToken(token.PLUS, l.ch)
      break

    case '-':
      tok = newToken(token.MINUS, l.ch)
      break

    case '!':
      if (peekChar(l) == '=') {
        let ch = l.ch
        readChar(l)
        let literal = ch + l.ch
        tok = new token.Token(token.NOT_EQ, literal)
      } else {
        tok = newToken(token.BANG, l.ch)
      }
      break

    case '/':
      tok = newToken(token.SLASH, l.ch)
      break

    case '*':
      tok = newToken(token.ASTERISK, l.ch)
      break

    case '<':
      tok = newToken(token.LT, l.ch)
      break

    case '>':
      tok = newToken(token.GT, l.ch)
      break

    case ';':
      tok = newToken(token.SEMICOLON, l.ch)
      break

    case ',':
      tok = newToken(token.COMMA, l.ch)
      break

    case '{':
      tok = newToken(token.LBRACE, l.ch)
      break

    case '}':
      tok = newToken(token.RBRACE, l.ch)
      break

    case '(':
      tok = newToken(token.LPAREN, l.ch)
      break

    case ')':
      tok = newToken(token.RPAREN, l.ch)
      break

    case '\0':
      tok.Literal = ''
      tok.Type = token.EOF
      break

    default:
      if (isLetter(l.ch)) {
        tok.Literal = readIdentifier(l)
        tok.Type = token.LookupIdent(tok.Literal)
        return tok
      } else if (isDigit(l.ch)) {
        tok.Type = token.INT
        tok.Literal = readNumber(l)
        return tok
      } else {
        tok = newToken(token.ILLEGAL, l.ch)
      }
  }

  readChar(l)
  return tok
}

function skipWhitespace(l) {
  while (l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r') {
    readChar(l)
  }
}

function readChar(l) {
  if (l.readPosition >= l.input.length) {
    l.ch = '\0'
  } else {
    l.ch = l.input[l.readPosition]
  }
  l.position = l.readPosition
  l.readPosition += 1
}

function peekChar(l) {
  if (l.readPosition >= l.input.length) {
    return 0
  } else {
    return l.input[l.readPosition]
  }
}

function readIdentifier(l) {
  let position = l.position
  while (isLetter(l.ch)) {
    readChar(l)
  }
  return l.input.slice(position, l.position)
}

function readNumber(l) {
  let position = l.position
  while (isDigit(l.ch)) {
    readChar(l)
  }
  return l.input.slice(position, l.position)
}

function isLetter(ch) {
  return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch == '_'
}

function isDigit(ch) {
  return '0' <= ch && ch <= '9'
}

function newToken(tokenType, ch) {
  return new token.Token(tokenType, ch)
}

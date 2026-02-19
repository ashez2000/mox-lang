export const ILLEGAL = 'ILLEGAL'
export const EOF = 'EOF'
export const IDENT = 'IDENT'
export const INT = 'INT'
export const ASSIGN = 'ASSIGN'
export const PLUS = '+'
export const MINUS = '-'
export const BANG = '!'
export const ASTERISK = '*'
export const SLASH = '/'
export const LT = '<'
export const GT = '>'
export const EQ = '=='
export const NOT_EQ = '!='
export const COMMA = ','
export const SEMICOLON = ';'
export const LPAREN = '('
export const RPAREN = ')'
export const LBRACE = '{'
export const RBRACE = '}'
export const FUNCTION = 'FUNCTION'
export const LET = 'LET'
export const TRUE = 'TRUE'
export const FALSE = 'FALSE'
export const IF = 'IF'
export const ELSE = 'ELSE'
export const RETURN = 'RETURN'

export class Token {
  constructor(type, literal) {
    this.Type = type
    this.Literal = literal
  }
}

const keywords = new Map([
  ['fn', FUNCTION],
  ['let', LET],
  ['true', TRUE],
  ['false', FALSE],
  ['if', IF],
  ['else', ELSE],
  ['return', RETURN],
])

export function LookupIdent(ident) {
  if (keywords.has(ident)) {
    return keywords.get(ident)
  }
  return IDENT
}

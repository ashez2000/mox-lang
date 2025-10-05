/**
 * TokenType
 */
export enum TokenType {
  Illegal = 0,
  Eof,
  Ident,
  Int,
  String,
  Assign,
  Plus,
  Minus,
  Bang,
  Asterisk,
  Slash,
  Lt,
  Gt,
  Lte,
  Gte,
  Eq,
  NotEq,
  Comma,
  Semicolon,
  Colon,
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Function,
  Let,
  True,
  False,
  If,
  Else,
  Return,
}

/**
 * Keywords in Mox
 */
export const keywords = new Map<String, TokenType>([
  ['fn', TokenType.Function],
  ['let', TokenType.Let],
  ['true', TokenType.True],
  ['false', TokenType.False],
  ['if', TokenType.If],
  ['else', TokenType.Else],
  ['return', TokenType.Return],
])

/**
 * Token
 */
export class Token {
  constructor(
    public type: TokenType,
    public line: number = 0,
    public literal?: string
  ) {}

  static debug(t: Token) {
    const line = String(t.line).padStart(4, '0')
    const typeName = TokenType[t.type] ?? 'Unknown'
    if (t.literal) {
      console.log(`${line} ${typeName}(${t.literal})`)
    } else {
      console.log(`${line} ${typeName}`)
    }
  }
}

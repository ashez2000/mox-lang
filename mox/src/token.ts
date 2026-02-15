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
 * Keywords in Mox Lang
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
    public literal?: string,
  ) {}
}

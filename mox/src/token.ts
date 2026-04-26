/**
 * TokenType
 */
export enum TokenType {
  Illegal = 'Illegal',
  Eof = 'Eof',
  Ident = 'Ident',
  Int = 'Int',
  String = 'String',
  Assign = 'Assign',
  Plus = 'Plus',
  Minus = 'Minus',
  Bang = 'Bang',
  Asterisk = 'Asterisk',
  Slash = 'Slash',
  Lt = 'Lt',
  Gt = 'Gt',
  Eq = 'Eq',
  NotEq = 'NotEq',
  Comma = 'Comma',
  Semicolon = 'Semicolon',
  Colon = 'Colon',
  LParen = 'LParen',
  RParen = 'RParen',
  LBrace = 'LBrace',
  RBrace = 'RBrace',
  LBracket = 'LBracket',
  RBracket = 'RBracket',
  Function = 'Function',
  Let = 'Let',
  True = 'True',
  False = 'False',
  If = 'If',
  Else = 'Else',
  Return = 'Return',
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

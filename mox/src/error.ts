import { Token, TokenType } from './token.js'

export function formattedError(line: number, message: string, where: string = '') {
  return `[line ${line}] Error${where}: ${message}`
}

export function formattedErrorWithToken(token: Token, message: string) {
  if (token.type == TokenType.EOF) {
    return formattedError(token.line, message, ' at end')
  }

  return formattedError(token.line, message, ` at '${token.literal}'`)
}

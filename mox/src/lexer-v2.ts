export class Lexer {
  private source: string
  private start: number
  private current: number
  private line: number

  constructor(source: string) {
    this.source = source
    this.start = 0
    this.current = 0
    this.line = 1
  }

  public next() {}

  private advance(): string {
    this.current += 1
    return this.source[this.current - 1]
  }
}

import { BlockStmt, Ident } from './ast'
import { Environment } from './environment'

export enum MonkeyObjectType {
  INT = 'INT',
  BOOL = 'BOOL',
  STR = 'STR',
  NULL = 'NULL',
  RETURN = 'RETURN',
  FUNC = 'FUNC',
}

export abstract class MonkeyObject {
  abstract type: MonkeyObjectType
  abstract display(): string
}

export class Null implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.NULL
  display(): string {
    return 'null'
  }
}

export class Int implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.INT

  constructor(public value: number) {}

  display(): string {
    return `${this.value}`
  }
}

export class Bool implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.BOOL
  constructor(public value: boolean) {}

  display(): string {
    return `${this.value}`
  }
}

export class Str implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.STR
  constructor(public value: string) {}

  display(): string {
    return this.value
  }
}

export class Return implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.RETURN

  constructor(public value: MonkeyObject) {}

  display(): string {
    return `${this.value.display()}`
  }
}

export class Func implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.FUNC

  constructor(public params: Ident[], public body: BlockStmt, public env: Environment) {}

  display(): string {
    return `fn (${this.params.map((i) => i.name)})`
  }
}

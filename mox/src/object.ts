import { Ident } from './ast/expr'
import { Block } from './ast/stmt'
import { Environment } from './environment'

export enum ObjectType {
  INT = 'INT',
  BOOL = 'BOOL',
  STRING = 'STRING',
  NULL = 'NULL',
  RETURN = 'RETURN',
  FUNC = 'FUNC',
  BUILTIN = 'BUILTIN',
  ERROR = 'ERROR',
}

export abstract class MoxObject {
  abstract type: ObjectType
  abstract toString(): string
}

export class Null implements MoxObject {
  type: ObjectType = ObjectType.NULL

  toString(): string {
    return 'null'
  }
}

export class Int implements MoxObject {
  type: ObjectType = ObjectType.INT

  constructor(public value: number) {}

  toString(): string {
    return `${this.value}`
  }
}

export class Bool implements MoxObject {
  type: ObjectType = ObjectType.BOOL
  constructor(public value: boolean) {}

  toString(): string {
    return `${this.value}`
  }
}

export class String implements MoxObject {
  type: ObjectType = ObjectType.STRING

  constructor(public value: string) {}

  toString(): string {
    return this.value
  }
}

export class Return implements MoxObject {
  type: ObjectType = ObjectType.RETURN

  constructor(public value: MoxObject) {}

  toString(): string {
    return this.value.toString()
  }
}

export class Func implements MoxObject {
  type: ObjectType = ObjectType.FUNC

  constructor(public params: Ident[], public body: Block, public env: Environment) {}

  toString(): string {
    return `function`
  }
}

export type BuitlinFn = (...args: MoxObject[]) => MoxObject

export class Builtin implements MoxObject {
  type: ObjectType = ObjectType.BUILTIN

  constructor(public func: BuitlinFn) {}

  toString(): string {
    return 'builtin'
  }
}

export class Error implements MoxObject {
  type: ObjectType = ObjectType.ERROR

  constructor(public message: string) {}

  toString(): string {
    return this.message
  }
}

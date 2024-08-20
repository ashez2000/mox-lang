export enum MonkeyObjectType {
  INT = 'INT',
  BOOL = 'BOOL',
  NULL = 'NULL',
  RETURN = 'RETURN',
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

export class Return implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.RETURN

  constructor(public value: MonkeyObject) {}

  display(): string {
    return `${this.value.display()}`
  }
}

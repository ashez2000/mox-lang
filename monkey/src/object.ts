export enum MonkeyObjectType {
  INT = 'INT',
  BOOL = 'BOOL',
  NULL = 'NULL',
}

export abstract class MonkeyObject {
  abstract type: MonkeyObjectType
}

export class Null implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.NULL
}

export class Int implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.INT
  constructor(public value: number) {}
}

export class Bool implements MonkeyObject {
  type: MonkeyObjectType = MonkeyObjectType.BOOL
  constructor(public value: boolean) {}
}

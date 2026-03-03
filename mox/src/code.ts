import { MoxObject } from './object.js'

// TODO: Refactor opcode structure
export abstract class OpCode {}

export class OpConstant extends OpCode {
  constructor(public value: MoxObject) {
    super()
  }
}

export class OpAdd extends OpCode {
  constructor() {
    super()
  }
}
export const OP_ADD = new OpAdd()

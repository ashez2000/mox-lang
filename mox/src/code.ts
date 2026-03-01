import { MoxObject } from './object.js'

export abstract class OpCode {}

export class ConstantOpCode extends OpCode {
  constructor(public value: MoxObject) {
    super()
  }
}

export class AddOpCode extends OpCode {
  constructor() {
    super()
  }
}

export const ADD_OPCODE = new AddOpCode()

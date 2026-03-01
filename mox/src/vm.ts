import { AddOpCode, ConstantOpCode, OpCode } from './code.js'
import * as object from './object.js'

type MoxObject = object.MoxObject

export class Vm {
  private instruction: OpCode[]
  private stack: MoxObject[]
  private sp: number

  constructor(instruction: OpCode[]) {
    this.instruction = instruction
    this.stack = []
    this.sp = 0
  }

  run() {
    for (let i of this.instruction) {
      if (i instanceof ConstantOpCode) {
        this.push(i.value)
      }

      if (i instanceof AddOpCode) {
        let r = this.pop() as object.Int
        let l = this.pop() as object.Int
        this.push(new object.Int(r.value + l.value))
      }
    }
  }

  top(): MoxObject {
    return this.stack[this.sp - 1]
  }

  private push(o: MoxObject) {
    this.stack.push(o)
    this.sp += 1
  }

  private pop(): MoxObject {
    let o = this.stack.pop()!
    this.sp -= 1
    return o
  }
}

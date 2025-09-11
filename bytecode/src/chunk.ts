import { Value, ValuePool } from './value'

/** Operation Code */
export enum OpCode {
  /** Instruction to return from the current function */
  OP_RETURN = 0,

  /** Instruction to load/produce a constant value */
  OP_CONSTANT,
}

/**
 * Chunk contains dynamic array of instructions
 */
export class Chunk {
  // Ideally code: Byte[]
  public code: number[] = []
  public lines: number[] = []

  // Constants
  public valuePool: ValuePool

  constructor() {
    this.valuePool = new ValuePool()
  }

  public write(byte: number, line: number) {
    this.code.push(byte)
    this.lines.push(line)
  }

  public addConstant(value: Value): number {
    this.valuePool.write(value)
    return this.valuePool.values.length - 1
  }

  public free() {
    this.valuePool.free()
    this.code.length = 0
  }
}

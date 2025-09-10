/** Operation Code */
export enum OpCode {
  /** Instruction to return from the current function */
  OP_RETURN,
}

/**
 * Chunk contains dynamic array of instructions
 */
export class Chunk {
  // Ideally code: Byte[]
  public code: Number[] = []

  public write(byte: Number) {
    this.code.push(byte)
  }

  public free() {
    this.code.length = 0
  }
}

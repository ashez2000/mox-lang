import { Chunk, OpCode } from './chunk.js'

export function disassembleChunk(chunk: Chunk, name: String) {
  console.log(`Chunk: ${name}`)
  for (let offset = 0; offset < chunk.code.length; ) {
    offset = disassembleInstruction(chunk, offset)
  }
}

function disassembleInstruction(chunk: Chunk, offset: number): number {
  const instruction = chunk.code[offset]

  switch (instruction) {
    case OpCode.OP_RETURN:
      return simpleInstruction('OP_RETURN', offset)

    case OpCode.OP_CONSTANT:
      return constantInstruction('OP_CONSTANT', chunk, offset)

    default:
      console.log('Unknown opcode:', instruction)
      return offset + 1
  }
}

function simpleInstruction(name: string, offset: number): number {
  console.log(offset, name)
  return offset + 1
}

function constantInstruction(name: string, chunk: Chunk, offset: number): number {
  const idx = chunk.code[offset + 1]
  const value = chunk.valuePool.values[idx]
  console.log(offset, name, value)

  return offset + 2
}

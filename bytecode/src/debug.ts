import { Chunk, OpCode } from './chunk.js'

export function disassembleChunk(chunk: Chunk, name: String) {
  console.log('Chunk:', name)
  for (let offset = 0; offset < chunk.code.length; ) {
    offset = disassembleInstruction(chunk, offset)
  }
}

function disassembleInstruction(chunk: Chunk, offset: number): number {
  const instruction = chunk.code[offset]

  switch (instruction) {
    case OpCode.OP_RETURN:
      return simpleInstruction(chunk, 'OP_RETURN', offset)

    case OpCode.OP_CONSTANT:
      return constantInstruction(chunk, 'OP_CONSTANT', offset)

    default:
      console.log('Unknown opcode:', instruction)
      return offset + 1
  }
}

function simpleInstruction(chunk: Chunk, name: string, offset: number): number {
  console.log('Line:', chunk.lines[offset], '|', offset, name)
  return offset + 1
}

function constantInstruction(chunk: Chunk, name: string, offset: number): number {
  const idx = chunk.code[offset + 1]
  const value = chunk.valuePool.values[idx]
  console.log('Line:', chunk.lines[offset], '|', offset, name, value)

  return offset + 2
}

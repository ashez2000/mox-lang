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
    default:
      console.log('Unknown opcode:', instruction)
      return offset + 1
  }
}

function simpleInstruction(name: string, offset: number): number {
  console.log(offset, name)
  return offset + 1
}

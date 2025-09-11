import { Chunk, OpCode } from './chunk'
import { disassembleChunk } from './debug'

const chunk = new Chunk()
chunk.write(OpCode.OP_RETURN, 1)

// Adding 1.2 constant value to ValuePool
const idx = chunk.addConstant(1.2)

// Like 2 byte instruction
// OP_CONTANT <constant_value_idx>
chunk.write(OpCode.OP_CONSTANT, 2)
chunk.write(idx, 3)

disassembleChunk(chunk, 'Test')

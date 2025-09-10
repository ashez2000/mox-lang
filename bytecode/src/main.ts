import { Chunk, OpCode } from './chunk'
import { disassembleChunk } from './debug'

const chunk = new Chunk()
chunk.write(OpCode.OP_RETURN)
disassembleChunk(chunk, 'Test')

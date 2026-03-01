import { ADD_OPCODE, ConstantOpCode, OpCode } from './code.js'
import * as expr from './expr.js'
import { Program, Stmt } from './stmt.js'
import * as object from './object.js'

export class Complier {
  public instructions: OpCode[] = []

  constructor() {}

  // populates the instructions and constant pool
  compile(program: Program) {
    for (let s of program.statements) {
      this.compileStmt(s)
    }
  }

  compileStmt(stmt: Stmt) {
    if (stmt instanceof expr.Infix) {
      this.compileExpr(stmt.left)
      this.compileExpr(stmt.right)
      // TODO: match operator
      this.instructions.push(ADD_OPCODE)
    }
  }

  compileExpr(e: expr.Expr) {
    if (e instanceof expr.Int) {
      this.instructions.push(new ConstantOpCode(new object.Int(e.value)))
    }
  }
}

import { ADD_OPCODE, ConstantOpCode, OpCode } from './code.js'
import * as expr from './expr.js'
import * as stmt from './stmt.js'
import * as object from './object.js'

export class Complier {
  public instructions: OpCode[] = []

  constructor() {}

  // populates the instructions and constant pool
  compile(program: stmt.Program) {
    for (let s of program.statements) {
      this.compileStmt(s)
    }
  }

  compileStmt(s: stmt.Stmt) {
    if (s instanceof stmt.Expression) {
      this.compileExpr(s.expr)
    }
  }

  compileExpr(e: expr.Expr) {
    if (e instanceof expr.Infix) {
      this.compileExpr(e.left)
      this.compileExpr(e.right)
      // TODO: match operator
      this.instructions.push(ADD_OPCODE)
    }

    if (e instanceof expr.Int) {
      this.instructions.push(new ConstantOpCode(new object.Int(e.value)))
    }
  }
}

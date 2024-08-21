import * as stmt from './ast/stmt'
import * as expr from './ast/expr'
import * as object from './object'
import { Environment } from './environment'

type MoxObject = object.MoxObject

const NULL = new object.Null()
const TRUE = new object.Bool(true)
const FALSE = new object.Bool(false)

export class Interpreter implements stmt.Visitor<MoxObject>, expr.Visitor<MoxObject> {
  private environment = new Environment()

  interpret(program: stmt.Program) {
    return program.accept(this)
  }

  private evaluate(expr: expr.Expr): MoxObject {
    return expr.accept(this)
  }

  private execute(stmt: stmt.Stmt): MoxObject {
    return stmt.accept(this)
  }

  //
  // statements
  //

  /** returns the last executed statement */
  visitProgramStmt(stmt: stmt.Program): object.MoxObject {
    let value: MoxObject = NULL

    for (const s of stmt.statements) {
      value = this.execute(s)
      if (value instanceof object.Return) {
        return value
      }
    }

    return value
  }

  visitLetStmt(stmt: stmt.Let): object.MoxObject {
    return NULL
  }

  visitReturnStmt(stmt: stmt.Return): object.MoxObject {
    return NULL
  }

  visitPrintStmt(stmt: stmt.Print): object.MoxObject {
    return NULL
  }

  visitExprStmt(stmt: stmt.Expr): object.MoxObject {
    return this.evaluate(stmt.expr)
  }

  visitBlockStmt(stmt: stmt.Block): object.MoxObject {
    return NULL
  }

  //
  // expressions
  //

  visitIdentExpr(expr: expr.Ident): object.MoxObject {
    return NULL
  }

  visitIntExpr(expr: expr.Int): object.MoxObject {
    return new object.Int(expr.value)
  }

  visitBoolExpr(expr: expr.Bool): object.MoxObject {
    return new object.Bool(expr.value)
  }

  visitStringExpr(expr: expr.String): object.MoxObject {
    return new object.String(expr.value)
  }

  visitPrefixExpr(expr: expr.Prefix): object.MoxObject {
    return NULL
  }

  visitInfixExpr(expr: expr.Infix): object.MoxObject {
    return NULL
  }

  visitIfExpr(expr: expr.If): object.MoxObject {
    return NULL
  }

  visitFuncExpr(expr: expr.Func): object.MoxObject {
    return NULL
  }

  visitCallExpr(expr: expr.Call): object.MoxObject {
    return NULL
  }
}

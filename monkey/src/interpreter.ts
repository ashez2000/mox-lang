import {
  BlockStmt,
  Bool,
  CallExpr,
  Expr,
  ExprStmt,
  ExprVisitor,
  FnExpr,
  Ident,
  IfExpr,
  Infix,
  Int,
  Let,
  Prefix,
  Return,
  Stmt,
  StmtVisitor,
} from './ast'
import * as obj from './object'

const NULL = new obj.Null()
const TRUE = new obj.Bool(true)
const FALSE = new obj.Bool(false)

export class Interpreter implements ExprVisitor<obj.MonkeyObject>, StmtVisitor<obj.MonkeyObject> {
  //
  // statements
  //

  evaluate(ast: Stmt[]): obj.MonkeyObject[] {
    const result: obj.MonkeyObject[] = []

    for (const s of ast) {
      result.push(s.accept(this))
    }

    return result
  }

  visitLetStmt(stmt: Let): obj.MonkeyObject {
    return NULL
  }

  visitReturnStmt(stmt: Return): obj.MonkeyObject {
    return NULL
  }

  visitExprStmtStmt(stmt: ExprStmt): obj.MonkeyObject {
    return stmt.value.accept(this)
  }

  visitBlockStmtStmt(stmt: BlockStmt): obj.MonkeyObject {
    return NULL
  }

  //
  // expressions
  //

  visitIdentExpr(expr: Ident): obj.MonkeyObject {
    return NULL
  }

  visitIntExpr(expr: Int): obj.MonkeyObject {
    return new obj.Int(expr.value)
  }

  visitBoolExpr(expr: Bool): obj.MonkeyObject {
    return NULL
  }

  visitPrefixExpr(expr: Prefix): obj.MonkeyObject {
    return NULL
  }

  visitInfixExpr(expr: Infix): obj.MonkeyObject {
    return NULL
  }

  visitIfExprExpr(expr: IfExpr): obj.MonkeyObject {
    return NULL
  }

  visitFnExprExpr(expr: FnExpr): obj.MonkeyObject {
    return NULL
  }

  visitCallExprExpr(expr: CallExpr): obj.MonkeyObject {
    return NULL
  }
}

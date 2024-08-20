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
    return expr.value ? TRUE : FALSE
  }

  visitPrefixExpr(expr: Prefix): obj.MonkeyObject {
    const right = expr.right.accept(this)

    switch (expr.operator) {
      case '!':
        return this.evalBangExpr(right)
      case '-':
        return this.evalMinusPrefixExpr(right)
      default:
        return NULL
    }
  }

  evalBangExpr(right: obj.MonkeyObject): obj.MonkeyObject {
    switch (right) {
      case TRUE:
        return FALSE
      case FALSE:
        return TRUE
      case NULL:
        return TRUE
      default:
        return FALSE
    }
  }

  evalMinusPrefixExpr(right: obj.MonkeyObject): obj.MonkeyObject {
    if (!(right instanceof obj.Int)) {
      return NULL
    }
    return new obj.Int(-right.value)
  }

  visitInfixExpr(expr: Infix): obj.MonkeyObject {
    const left = expr.left.accept(this)
    const right = expr.right.accept(this)
    return this.evalInfixExpr(expr.operator, left, right)
  }

  evalInfixExpr(op: string, left: obj.MonkeyObject, right: obj.MonkeyObject) {
    if (left instanceof obj.Int && right instanceof obj.Int) {
      return this.evalIntInfixExpr(op, left, right)
    }

    return NULL
  }

  evalIntInfixExpr(op: string, left: obj.Int, right: obj.Int) {
    switch (op) {
      case '+':
        return new obj.Int(left.value + right.value)
      case '-':
        return new obj.Int(left.value - right.value)
      case '*':
        return new obj.Int(left.value * right.value)
      case '/':
        return new obj.Int(left.value / right.value)
      default:
        return NULL
    }
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

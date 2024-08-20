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
  evaluate(ast: Stmt[]): obj.MonkeyObject[] {
    const result: obj.MonkeyObject[] = []

    for (const s of ast) {
      const value = s.accept(this)
      result.push(value)
      if (value instanceof obj.Return) {
        return result
      }
    }

    return result
  }

  //
  // statements
  //

  visitLetStmt(stmt: Let): obj.MonkeyObject {
    return NULL
  }

  visitReturnStmt(stmt: Return): obj.MonkeyObject {
    const value = stmt.value.accept(this)
    return new obj.Return(value)
  }

  visitExprStmtStmt(stmt: ExprStmt): obj.MonkeyObject {
    return stmt.value.accept(this)
  }

  visitBlockStmtStmt(stmt: BlockStmt): obj.MonkeyObject {
    // TODO: looks funny
    return this.evaluate(stmt.statements).at(-1) ?? NULL
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
    const cond = expr.condidtion.accept(this)

    if (this.isTruthy(cond)) {
      return expr.thenBlock.accept(this)
    }

    if (expr.elseBlock) {
      return expr.elseBlock.accept(this)
    }

    return NULL
  }

  isTruthy(obj: obj.MonkeyObject): boolean {
    switch (obj) {
      case NULL:
        return false
      case TRUE:
        return true
      case FALSE:
        return false
      default:
        return true
    }
  }

  visitFnExprExpr(expr: FnExpr): obj.MonkeyObject {
    return NULL
  }

  visitCallExprExpr(expr: CallExpr): obj.MonkeyObject {
    return NULL
  }
}
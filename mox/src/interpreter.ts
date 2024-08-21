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
    return naiveBooltoObject(expr.value)
  }

  visitStringExpr(expr: expr.String): object.MoxObject {
    return new object.String(expr.value)
  }

  visitPrefixExpr(expr: expr.Prefix): object.MoxObject {
    const right = this.evaluate(expr.right)
    switch (expr.operator) {
      case '!':
        return evalBangOperator(right)
      case '-':
        return evalMinusPrifixOperator(right)
      default:
        return NULL
    }
  }

  visitInfixExpr(expr: expr.Infix): object.MoxObject {
    const left = this.evaluate(expr.left)
    const right = this.evaluate(expr.right)
    return evalInfixExpression(expr.operator, left, right)
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

//
// helpers
//

function naiveBooltoObject(bool: boolean) {
  return bool ? TRUE : FALSE
}

function evalBangOperator(obj: MoxObject): MoxObject {
  switch (obj) {
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

function evalMinusPrifixOperator(obj: MoxObject): MoxObject {
  if (!(obj instanceof object.Int)) {
    return NULL
  }

  return new object.Int(-obj.value)
}

function evalInfixExpression(operator: string, left: MoxObject, right: MoxObject) {
  if (left instanceof object.Int && right instanceof object.Int) {
    return evalIntInfixExpression(operator, left, right)
  }

  if (operator == '==') {
    return naiveBooltoObject(left == right)
  }

  if (operator == '!=') {
    return naiveBooltoObject(left != right)
  }

  return NULL
}

function evalIntInfixExpression(operator: string, left: object.Int, right: object.Int) {
  switch (operator) {
    case '+':
      return new object.Int(left.value + right.value)
    case '-':
      return new object.Int(left.value - right.value)
    case '*':
      return new object.Int(left.value * right.value)
    case '/':
      return new object.Int(left.value / right.value)
    case '<':
      return naiveBooltoObject(left.value < right.value)
    case '>':
      return naiveBooltoObject(left.value > right.value)
    case '==':
      return naiveBooltoObject(left.value == right.value)
    case '!=':
      return naiveBooltoObject(left.value != right.value)
    default:
      return NULL
  }
}

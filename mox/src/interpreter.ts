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
        return value.value // unwrap return value
      }

      if (value instanceof object.Error) {
        return value
      }
    }

    return value
  }

  visitLetStmt(stmt: stmt.Let): object.MoxObject {
    const value = this.evaluate(stmt.expr)
    this.environment.set(stmt.name.name, value)
    return value
  }

  visitReturnStmt(stmt: stmt.Return): object.MoxObject {
    const value = this.evaluate(stmt.expr)
    return new object.Return(value)
  }

  visitPrintStmt(stmt: stmt.Print): object.MoxObject {
    const value = this.evaluate(stmt.expr)
    console.log(value.toString())
    return value
  }

  visitExprStmt(stmt: stmt.Expr): object.MoxObject {
    return this.evaluate(stmt.expr)
  }

  visitBlockStmt(stmt: stmt.Block): object.MoxObject {
    let value: MoxObject = NULL

    for (const s of stmt.statements) {
      value = this.execute(s)

      if (value instanceof object.Return) {
        return value // bubble up return value
      }

      if (value instanceof object.Error) {
        return value
      }
    }

    return value
  }

  //
  // expressions
  //

  visitIdentExpr(expr: expr.Ident): object.MoxObject {
    return this.environment.get(expr.name) ?? NULL
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
        return error(`unknown operator: '${expr.operator}${right.type}'`)
    }
  }

  visitInfixExpr(expr: expr.Infix): object.MoxObject {
    const left = this.evaluate(expr.left)
    const right = this.evaluate(expr.right)
    return evalInfixExpression(expr.operator, left, right)
  }

  visitIfExpr(expr: expr.If): object.MoxObject {
    const condition = this.evaluate(expr.condidtion)

    if (isTruthy(condition)) {
      return this.execute(expr.consequence)
    }

    if (expr.alternative) {
      return this.execute(expr.alternative)
    }

    return NULL
  }

  visitFuncExpr(expr: expr.Func): object.MoxObject {
    return new object.Func(expr.parameters, expr.body, this.environment)
  }

  visitCallExpr(expr: expr.Call): object.MoxObject {
    const func = this.evaluate(expr.func)
    if (!(func instanceof object.Func)) {
      return error('not a function')
    }

    const args = this.evalExpressions(expr.args)

    return this.applyFunc(func, args)
  }

  evalExpressions(exprs: expr.Expr[]) {
    const values: MoxObject[] = []
    for (const e of exprs) {
      // TODO: error handling
      const value = this.evaluate(e)
      values.push(value)
    }

    return values
  }

  applyFunc(func: object.Func, args: MoxObject[]) {
    const extenedEnv = this.extendFuncEnv(func, args)
    const previous = this.environment
    this.environment = extenedEnv
    let value = this.execute(func.body)
    if (value instanceof object.Return) {
      value = value.value
    }
    this.environment = previous
    return value
  }

  extendFuncEnv(func: object.Func, args: MoxObject[]) {
    const env = new Environment(func.env)
    for (let i = 0; i < func.params.length; i++) {
      env.set(func.params[i].name, args[i])
    }
    return env
  }
}

//
// helpers
//

function naiveBooltoObject(bool: boolean) {
  return bool ? TRUE : FALSE
}

function isTruthy(obj: MoxObject) {
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
    return error(`unknown operator: '-' ${obj.type}`)
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

  if (left.type !== right.type) {
    return error(`type mismatch: ${left.type} '${operator}' ${right.type}`)
  }

  return error(`unknown operator: '${operator}'`)
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
      return error(`unknown operator: '${operator}'`)
  }
}

function error(message: string) {
  return new object.Error(message)
}

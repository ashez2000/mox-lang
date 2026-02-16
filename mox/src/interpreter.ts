import * as stmt from './stmt.js'
import * as expr from './expr.js'
import * as object from './object.js'
import builtin from './builtin.js'
import { Environment } from './environment.js'
import { Token, TokenType } from './token.js'

type MoxObject = object.MoxObject

const NULL = new object.Null()
const TRUE = new object.Bool(true)
const FALSE = new object.Bool(false)

export class Interpreter
  implements stmt.Visitor<MoxObject>, expr.Visitor<MoxObject>
{
  stdout: string[]
  private environment = new Environment()

  constructor() {
    this.stdout = []
  }

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

      if (isReturn(value)) {
        return value.value // unwrap return value
      }

      if (isError(value)) {
        return value
      }
    }

    return value
  }

  visitLetStmt(stmt: stmt.Let): object.MoxObject {
    const value = this.evaluate(stmt.value)
    this.environment.set(stmt.name.name.literal!, value)
    return value
  }

  visitReturnStmt(stmt: stmt.Return): object.MoxObject {
    const value = this.evaluate(stmt.value as expr.Expr)
    return new object.Return(value)
  }

  visitPrintStmt(stmt: stmt.Print): object.MoxObject {
    const value = this.evaluate(stmt.expr)
    this.stdout.push(value.toString())
    return value
  }

  visitExpressionStmt(stmt: stmt.Expression): object.MoxObject {
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
    return (
      this.environment.get(expr.name.literal!) ??
      builtin.get(expr.name.literal!) ??
      NULL
    )
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
    switch (expr.operator.literal) {
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
      return this.execute(expr.thenBlock)
    }

    if (expr.elseBlock) {
      return this.execute(expr.elseBlock)
    }

    return NULL
  }

  visitFnExpr(expr: expr.Fn): object.MoxObject {
    return new object.Func(expr.parameters, expr.body, this.environment)
  }

  visitCallExpr(expr: expr.Call): object.MoxObject {
    const func = this.evaluate(expr.fnExpr)
    const args = this.evalExpressions(expr.args)

    if (func instanceof object.Func) {
      return this.applyFunc(func, args)
    }

    if (func instanceof object.Builtin) {
      return func.func(...args)
    }

    return error('not a function')
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
      env.set(func.params[i].name.literal!, args[i])
    }
    return env
  }

  visitArrayExpr(expr: expr.Array): object.MoxObject {
    const elements = this.evalExpressions(expr.elements)
    return new object.Array(elements)
  }

  visitIndexExpr(expr: expr.Index): object.MoxObject {
    const left = this.evaluate(expr.left)
    if (isError(left)) {
      return left
    }

    const index = this.evaluate(expr.index)
    if (isError(index)) {
      return index
    }

    return evalIndexExpression(left, index)
  }

  visitHashMapExpr(expr: expr.HashMap): object.MoxObject {
    const keys = expr.keys
    const values = expr.values
    const hashmap = new Map<string, MoxObject>()

    for (let i = 0; i < keys.length; i++) {
      const key = this.evaluate(keys[i])
      if (isError(key)) {
        return key
      }

      const value = this.evaluate(values[i])
      if (isError(value)) {
        return value
      }

      hashmap.set(key.toString(), value)
    }

    return new object.HashMap(hashmap)
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

function evalInfixExpression(
  operator: Token,
  left: MoxObject,
  right: MoxObject,
) {
  if (left instanceof object.Int && right instanceof object.Int) {
    return evalIntInfixExpression(operator, left, right)
  }

  if (operator.type == TokenType.Eq) {
    return naiveBooltoObject(left == right)
  }

  if (operator.type == TokenType.NotEq) {
    return naiveBooltoObject(left != right)
  }

  if (left.type !== right.type) {
    return error(`type mismatch: ${left.type} '${operator}' ${right.type}`)
  }

  return error(`unknown operator: '${operator}'`)
}

function evalIntInfixExpression(
  operator: Token,
  left: object.Int,
  right: object.Int,
) {
  switch (operator.type) {
    case TokenType.Plus:
      return new object.Int(left.value + right.value)
    case TokenType.Minus:
      return new object.Int(left.value - right.value)
    case TokenType.Asterisk:
      return new object.Int(left.value * right.value)
    case TokenType.Slash:
      return new object.Int(left.value / right.value)
    case TokenType.Lt:
      return naiveBooltoObject(left.value < right.value)
    case TokenType.Gt:
      return naiveBooltoObject(left.value > right.value)
    case TokenType.Eq:
      return naiveBooltoObject(left.value == right.value)
    case TokenType.Gt:
      return naiveBooltoObject(left.value != right.value)
    default:
      return error(`unknown operator: '${operator}'`)
  }
}

function evalIndexExpression(left: MoxObject, index: MoxObject): MoxObject {
  if (left instanceof object.Array && index instanceof object.Int) {
    return evalArrayIndexExpression(left, index)
  }

  if (left instanceof object.HashMap) {
    return evalHashMapIndexExpression(left, index)
  }

  return error('index operator not supported for ' + left.type)
}

function evalArrayIndexExpression(array: object.Array, index: object.Int) {
  if (index.value < 0 || index.value >= array.elements.length) {
    return NULL
  }

  return array.elements[index.value]
}

function evalHashMapIndexExpression(hashmap: object.HashMap, index: MoxObject) {
  return hashmap.values.get(index.toString()) ?? NULL
}

function error(message: string) {
  return new object.Error(message)
}

function isError(o: MoxObject) {
  return o instanceof object.Error
}

function isReturn(o: MoxObject) {
  return o instanceof object.Return
}

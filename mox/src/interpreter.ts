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
  Print,
  Return,
  Stmt,
  StmtVisitor,
  Str,
} from './ast'
import { Environment } from './environment'
import * as obj from './object'

const NULL = new obj.Null()
const TRUE = new obj.Bool(true)
const FALSE = new obj.Bool(false)

export class Interpreter implements ExprVisitor<obj.MonkeyObject>, StmtVisitor<obj.MonkeyObject> {
  private environment = new Environment()

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
    const value = stmt.value.accept(this)
    // TODO: fix ident name
    this.environment.set(stmt.name.name, value)
    return value
  }

  visitReturnStmt(stmt: Return): obj.MonkeyObject {
    const value = stmt.value.accept(this)
    return new obj.Return(value)
  }

  visitPrintStmt(stmt: Print): obj.MonkeyObject {
    const value = stmt.value.accept(this)
    // TODO: pass log as function
    console.log(value.display())
    return value
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
    return this.environment.get(expr.name) ?? NULL
  }

  visitIntExpr(expr: Int): obj.MonkeyObject {
    return new obj.Int(expr.value)
  }

  visitBoolExpr(expr: Bool): obj.MonkeyObject {
    return expr.value ? TRUE : FALSE
  }

  visitStrExpr(expr: Str): obj.MonkeyObject {
    return new obj.Str(expr.value)
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
    return new obj.Func(expr.parameters, expr.body, this.environment)
  }

  visitCallExprExpr(expr: CallExpr): obj.MonkeyObject {
    const fn = expr.fnExpr.accept(this)
    const args = this.evalExprs(expr.args)

    return this.applyFunc(fn, args)
  }

  evalExprs(exprs: Expr[]) {
    const result: obj.MonkeyObject[] = []

    for (const e of exprs) {
      const v = e.accept(this)
      result.push(v)
    }

    return result
  }

  applyFunc(fn: obj.MonkeyObject, args: obj.MonkeyObject[]) {
    let foo = fn as obj.Func // TODO: error handling
    const env = this.extendEnv(foo, args)
    let prev = this.environment
    this.environment = env
    const value = foo.body.accept(this)
    this.environment = prev
    return value
  }

  extendEnv(fn: obj.Func, args: obj.MonkeyObject[]) {
    const env = new Environment(this.environment)

    for (let i = 0; i < args.length; i++) {
      env.set(fn.params[i].name, args[i])
    }

    return env
  }
}

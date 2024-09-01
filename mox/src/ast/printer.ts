import * as Stmt from './stmt'
import * as Expr from './expr'

class AstPrinter implements Stmt.Visitor<string>, Expr.Visitor<string> {
  printStmt(stmt: Stmt.Stmt) {
    return stmt.accept(this)
  }

  printExpr(expr: Expr.Expr) {
    return expr.accept(this)
  }

  visitProgramStmt(stmt: Stmt.Program): string {
    return ''
  }

  visitBlockStmt(stmt: Stmt.Block): string {
    return ''
  }

  visitExprStmt(stmt: Stmt.Expr): string {
    return this.printExpr(stmt.expr)
  }

  visitLetStmt(stmt: Stmt.Let): string {
    return ''
  }

  visitReturnStmt(stmt: Stmt.Return): string {
    return ''
  }

  visitPrintStmt(stmt: Stmt.Print): string {
    return ''
  }

  visitIdentExpr(expr: Expr.Ident): string {
    return expr.name
  }

  visitBoolExpr(expr: Expr.Bool): string {
    return expr.token.literal
  }

  visitIntExpr(expr: Expr.Int): string {
    return expr.token.literal
  }

  visitStringExpr(expr: Expr.String): string {
    return expr.value
  }

  visitPrefixExpr(expr: Expr.Prefix): string {
    return `(${expr.operator}${this.printExpr(expr.right)})`
  }

  visitInfixExpr(expr: Expr.Infix): string {
    return `(${this.printExpr(expr.left)} ${expr.operator} ${this.printExpr(expr.right)})`
  }

  visitIfExpr(expr: Expr.If): string {
    return ''
  }

  visitFuncExpr(expr: Expr.Func): string {
    return ''
  }

  visitCallExpr(expr: Expr.Call): string {
    return ''
  }
}

const printer = new AstPrinter()
export default printer

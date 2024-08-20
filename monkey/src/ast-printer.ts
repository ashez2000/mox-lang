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

class AstPrinter implements StmtVisitor<string>, ExprVisitor<string> {
  print(ast: Expr | Stmt) {
    return ast.accept(this)
  }

  visitLetStmt(stmt: Let): string {
    return `let ${stmt.name} = ${this.print(stmt.value)};`
  }

  visitReturnStmt(stmt: Return): string {
    return `return ${this.print(stmt.value)}!`
  }

  visitExprStmtStmt(stmt: ExprStmt): string {
    return this.print(stmt.value)
  }

  visitBlockStmtStmt(stmt: BlockStmt): string {
    let out = ''

    for (const s of stmt.statements) {
      out += this.print(s)
    }

    return out
  }

  visitIdentExpr(expr: Ident): string {
    return expr.name
  }

  visitIntExpr(expr: Int): string {
    return expr.token.literal
  }

  visitBoolExpr(expr: Bool): string {
    return expr.token.literal
  }

  visitPrefixExpr(expr: Prefix): string {
    return `(${expr.operator} ${this.print(expr.right)})`
  }

  visitInfixExpr(expr: Infix): string {
    return `(${this.print(expr.left)} ${expr.operator} ${this.print(expr.right)})`
  }

  visitIfExprExpr(expr: IfExpr): string {
    let out = `if (${this.print(expr.condidtion)}) { ${this.print(expr.thenBlock)} }`
    if (expr.elseBlock) {
      out += ` else { ${this.print(expr.elseBlock)} }`
    }

    return out
  }

  visitFnExprExpr(expr: FnExpr): string {
    let params = ''
    for (let i = 0; i < params.length; i++) {
      params += this.print(expr.parameters[i])
      if (i != params.length - 1) {
        params += ', '
      }
    }

    return `fn (${params}) { ${this.print(expr.body)} }`
  }

  visitCallExprExpr(expr: CallExpr): string {
    let args = ''
    for (let i = 0; i < expr.args.length; i++) {
      args += this.print(expr.args[i])
      if (i != args.length - 1) {
        args += ', '
      }
    }

    return `${this.print(expr.fnExpr)}(${args})`
  }
}

export default new AstPrinter()

import { Ast, AstType, Expr } from './ast.js'

export function astToString(ast: Ast) {
  switch (ast.type) {
    case AstType.ExprStmt:
      return `${exprToString(ast.expr)};`

    default:
      return '(not implemented)'
  }
}

function exprToString(expr: Expr): string {
  switch (expr.type) {
    case AstType.Int:
      return expr.value.toString()
    case AstType.Prefix:
      return `(${expr.op.literal}${exprToString(expr.expr)})`
    case AstType.Infix:
      return `(${exprToString(expr.left)} ${expr.op.literal} ${exprToString(expr.right)})`
    default:
      return '(not implemented)'
  }
}

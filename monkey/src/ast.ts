import { Token } from './token.js'

//
// Stmt
//

export abstract class Stmt {
  abstract accept<T>(visitor: StmtVisitor<T>): T
}

export interface StmtVisitor<T> {
  visitLetStmt(stmt: Let): T
}

export class Let extends Stmt {
  constructor(public token: Token, public name: Identifier, public expr: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitLetStmt(this)
  }
}

//
// Expr
//

export abstract class Expr {
  abstract accept<T>(visitor: ExprVisitor<T>): T
}

export interface ExprVisitor<T> {
  visitIdentifierExpr(expr: Identifier): T
}

export class Identifier extends Expr {
  constructor(public name: Token, public value: string) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIdentifierExpr(this)
  }
}

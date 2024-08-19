// NOTE: this file is generated using generate-ast package

import { Token } from './token.js'

//
// Stmt
//

export abstract class Stmt {
  abstract accept<T>(visitor: StmtVisitor<T>): T
}

export interface StmtVisitor<T> {
  visitLetStmt(stmt: Let): T
  visitReturnStmt(stmt: Return): T
  visitExprStmtStmt(stmt: ExprStmt): T
  visitBlockStmtStmt(stmt: BlockStmt): T
}

export class Let extends Stmt {
  constructor(public token: Token, public name: Ident, public value: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitLetStmt(this)
  }
}

export class Return extends Stmt {
  constructor(public token: Token, public value: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitReturnStmt(this)
  }
}

export class ExprStmt extends Stmt {
  constructor(public token: Token, public value: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExprStmtStmt(this)
  }
}

export class BlockStmt extends Stmt {
  constructor(public token: Token, public statements: Stmt[]) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmtStmt(this)
  }
}

//
// Expr
//

export abstract class Expr {
  abstract accept<T>(visitor: ExprVisitor<T>): T
}

export interface ExprVisitor<T> {
  visitIdentExpr(expr: Ident): T
  visitBoolExpr(expr: Bool): T
  visitIntExpr(expr: Int): T
  visitPrefixExpr(expr: Prefix): T
  visitInfixExpr(expr: Infix): T
  visitIfExprExpr(expr: IfExpr): T
  visitFnExprExpr(expr: FnExpr): T
  visitCallExprExpr(expr: CallExpr): T
}

export class Ident extends Expr {
  constructor(public token: Token, public name: string) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIdentExpr(this)
  }
}

export class Bool extends Expr {
  constructor(public token: Token, public value: boolean) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBoolExpr(this)
  }
}

export class Int extends Expr {
  constructor(public token: Token, public value: number) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIntExpr(this)
  }
}

export class Prefix extends Expr {
  constructor(public token: Token, public operator: string, public right: Expr) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitPrefixExpr(this)
  }
}

export class Infix extends Expr {
  constructor(public token: Token, public operator: string, public left: Expr, public right: Expr) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitInfixExpr(this)
  }
}

export class IfExpr extends Expr {
  constructor(
    public token: Token,
    public condidtion: Expr,
    public thenBlock: BlockStmt,
    public elseBlock: BlockStmt | null
  ) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIfExprExpr(this)
  }
}

export class FnExpr extends Expr {
  constructor(public token: Token, public parameters: Ident[], public body: BlockStmt) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitFnExprExpr(this)
  }
}

export class CallExpr extends Expr {
  constructor(public token: Token, public fnExpr: Expr, public args: Expr[]) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitCallExprExpr(this)
  }
}

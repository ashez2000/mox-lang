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
  visitExpressionStmt(stmt: Expression): T
  visitBlockStmt(stmt: Block): T
}

export class Let extends Stmt {
  constructor(public token: Token, public name: Identifier, public expr: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitLetStmt(this)
  }
}

export class Return extends Stmt {
  constructor(public token: Token, public expr: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitReturnStmt(this)
  }
}

export class Expression extends Stmt {
  constructor(public expr: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExpressionStmt(this)
  }
}

export class Block extends Stmt {
  constructor(public statements: Stmt[]) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmt(this)
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
  visitBoolExpr(expr: Bool): T
  visitIntegerExpr(expr: Integer): T
  visitPrefixExpr(expr: Prefix): T
  visitInfixExpr(expr: Infix): T
  visitIfExpr(expr: If): T
}

export class Identifier extends Expr {
  constructor(public name: Token, public value: string) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIdentifierExpr(this)
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

export class Integer extends Expr {
  constructor(public token: Token, public value: number) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIntegerExpr(this)
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

export class If extends Expr {
  constructor(public token: Token, public condidtion: Expr, public thenBlock: Block, public elseBlock: Block | null) {
    super()
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIfExpr(this)
  }
}

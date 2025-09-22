import { Token } from './token.js'
import * as expr from './expr.js'

export abstract class Stmt {
  abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
  visitLetStmt(stmt: Let): T
  visitReturnStmt(stmt: Return): T
  visitPrintStmt(stmt: Print): T
  visitExpressionStmt(stmt: Expression): T
  visitBlockStmt(stmt: Block): T
  visitProgramStmt(stmt: Program): T
}

export class Let extends Stmt {
  constructor(public name: expr.Ident, public value: expr.Expr) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLetStmt(this)
  }
}

export class Return extends Stmt {
  constructor(public keyword: Token, public value?: expr.Expr) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitReturnStmt(this)
  }
}

export class Print extends Stmt {
  constructor(public expr: expr.Expr) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStmt(this)
  }
}

export class Expression extends Stmt {
  constructor(public expr: expr.Expr) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExpressionStmt(this)
  }
}

export class Block extends Stmt {
  constructor(public statements: Stmt[]) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBlockStmt(this)
  }
}

export class Program extends Stmt {
  constructor(public statements: Stmt[]) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitProgramStmt(this)
  }
}

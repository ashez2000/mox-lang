import { Token } from '../token.js'
import * as expr from './expr.js'

export abstract class Stmt {
  abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
  visitProgramStmt(stmt: Program): T
  visitLetStmt(stmt: Let): T
  visitReturnStmt(stmt: Return): T
  visitPrintStmt(stmt: Print): T
  visitExprStmt(stmt: Expr): T
  visitBlockStmt(stmt: Block): T
}

export class Program extends Stmt {
  constructor(public statements: Stmt[]) {
    super()
  }

  static new(statements: Stmt[]): Program {
    return new Program(statements)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitProgramStmt(this)
  }
}

export class Let extends Stmt {
  constructor(public token: Token, public name: expr.Ident, public expr: expr.Expr) {
    super()
  }

  static new(token: Token, name: expr.Ident, expr: expr.Expr): Let {
    return new Let(token, name, expr)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLetStmt(this)
  }
}

export class Return extends Stmt {
  constructor(public token: Token, public expr: expr.Expr) {
    super()
  }

  static new(token: Token, expr: expr.Expr): Return {
    return new Return(token, expr)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitReturnStmt(this)
  }
}

export class Print extends Stmt {
  constructor(public token: Token, public expr: expr.Expr) {
    super()
  }

  static new(token: Token, expr: expr.Expr): Print {
    return new Print(token, expr)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrintStmt(this)
  }
}

export class Expr extends Stmt {
  constructor(public token: Token, public expr: expr.Expr) {
    super()
  }

  static new(token: Token, expr: expr.Expr): Expr {
    return new Expr(token, expr)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExprStmt(this)
  }
}

export class Block extends Stmt {
  constructor(public token: Token, public statements: Stmt[]) {
    super()
  }

  static new(token: Token, statements: Stmt[]): Block {
    return new Block(token, statements)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBlockStmt(this)
  }
}

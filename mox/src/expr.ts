import { Token } from './token.js'
import * as stmt from './stmt.js'

export abstract class Expr {
  abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
  visitIdentExpr(expr: Ident): T
  visitBoolExpr(expr: Bool): T
  visitIntExpr(expr: Int): T
  visitStringExpr(expr: String): T
  visitPrefixExpr(expr: Prefix): T
  visitInfixExpr(expr: Infix): T
  visitIfExpr(expr: If): T
  visitFnExpr(expr: Fn): T
  visitCallExpr(expr: Call): T
  visitArrayExpr(expr: Array): T
  visitIndexExpr(expr: Index): T
  visitHashMapExpr(expr: HashMap): T
}

export class Ident extends Expr {
  constructor(public name: Token) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIdentExpr(this)
  }
}

export class Bool extends Expr {
  constructor(public value: boolean) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBoolExpr(this)
  }
}

export class Int extends Expr {
  constructor(public value: number) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIntExpr(this)
  }
}

export class String extends Expr {
  constructor(public value: string) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitStringExpr(this)
  }
}

export class Prefix extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrefixExpr(this)
  }
}

export class Infix extends Expr {
  constructor(public operator: Token, public left: Expr, public right: Expr) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitInfixExpr(this)
  }
}

export class If extends Expr {
  constructor(public condidtion: Expr, public thenBlock: stmt.Block, public elseBlock?: stmt.Block) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIfExpr(this)
  }
}

export class Fn extends Expr {
  constructor(public name: Token, public parameters: Ident[], public body: stmt.Block) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitFnExpr(this)
  }
}

export class Call extends Expr {
  constructor(public fnExpr: Expr, public args: Expr[]) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCallExpr(this)
  }
}

export class Array extends Expr {
  constructor(public elements: Expr[]) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitArrayExpr(this)
  }
}

export class Index extends Expr {
  constructor(public left: Expr, public index: Expr) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIndexExpr(this)
  }
}

export class HashMap extends Expr {
  constructor(public keys: Expr[], public values: Expr[]) {
    super()
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitHashMapExpr(this)
  }
}

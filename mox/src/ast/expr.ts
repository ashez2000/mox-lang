import { Token } from '../token.js'
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
  visitFuncExpr(expr: Func): T
  visitCallExpr(expr: Call): T
  visitArrayExpr(expr: Array): T
  visitIndexExpr(expr: Index): T
}

export class Ident extends Expr {
  constructor(public token: Token, public name: string) {
    super()
  }

  static new(token: Token, name: string): Ident {
    return new Ident(token, name)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIdentExpr(this)
  }
}

export class Bool extends Expr {
  constructor(public token: Token, public value: boolean) {
    super()
  }

  static new(token: Token, value: boolean): Bool {
    return new Bool(token, value)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBoolExpr(this)
  }
}

export class Int extends Expr {
  constructor(public token: Token, public value: number) {
    super()
  }

  static new(token: Token, value: number): Int {
    return new Int(token, value)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIntExpr(this)
  }
}

export class String extends Expr {
  constructor(public token: Token, public value: string) {
    super()
  }

  static new(token: Token, value: string): String {
    return new String(token, value)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitStringExpr(this)
  }
}

export class Prefix extends Expr {
  constructor(public token: Token, public operator: string, public right: Expr) {
    super()
  }

  static new(token: Token, operator: string, right: Expr): Prefix {
    return new Prefix(token, operator, right)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPrefixExpr(this)
  }
}

export class Infix extends Expr {
  constructor(public token: Token, public operator: string, public left: Expr, public right: Expr) {
    super()
  }

  static new(token: Token, operator: string, left: Expr, right: Expr): Infix {
    return new Infix(token, operator, left, right)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitInfixExpr(this)
  }
}

export class If extends Expr {
  constructor(
    public token: Token,
    public condidtion: Expr,
    public consequence: stmt.Block,
    public alternative: stmt.Block | null = null
  ) {
    super()
  }

  static new(token: Token, condidtion: Expr, consequence: stmt.Block, alternative: stmt.Block | null = null): If {
    return new If(token, condidtion, consequence, alternative)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIfExpr(this)
  }
}

export class Func extends Expr {
  constructor(public token: Token, public parameters: Ident[], public body: stmt.Block) {
    super()
  }

  static new(token: Token, parameters: Ident[], body: stmt.Block): Func {
    return new Func(token, parameters, body)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitFuncExpr(this)
  }
}

export class Call extends Expr {
  constructor(public token: Token, public func: Expr, public args: Expr[]) {
    super()
  }

  static new(token: Token, func: Expr, args: Expr[]): Call {
    return new Call(token, func, args)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCallExpr(this)
  }
}

export class Array extends Expr {
  constructor(public token: Token, public elements: Expr[]) {
    super()
  }

  static new(token: Token, elements: Expr[]): Array {
    return new Array(token, elements)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitArrayExpr(this)
  }
}

export class Index extends Expr {
  constructor(public token: Token, public left: Expr, public index: Expr) {
    super()
  }

  static new(token: Token, left: Expr, index: Expr): Index {
    return new Index(token, left, index)
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIndexExpr(this)
  }
}

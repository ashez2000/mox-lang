import { Token } from './token.js'

export interface Ast {
  type: AstType
}

export interface Statement extends Ast {}

export interface Expression extends Ast {}

export enum AstType {
  Program = 0,
  Let,
  Ident,
}

/**
 * Program Ast
 */
export class Program implements Ast {
  public type: AstType = AstType.Program
  constructor(public statements: Statement[]) {}
}

/**
 * Let Ast
 */
export class Let implements Statement {
  public type: AstType = AstType.Let
  // TODO: Make expr required
  constructor(public name: Ident, public expr?: Expression) {}
}

/**
 * Ident Ast
 */
export class Ident implements Expression {
  public type: AstType = AstType.Ident
  constructor(public name: Token) {}
}

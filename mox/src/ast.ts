import { Token } from './token.js'

export interface Ast {
  type: AstType
}

export interface Statement extends Ast {}

export interface Expression extends Ast {}

export enum AstType {
  Program = 0,

  Let,
  Return,
  ExpressionStatement,
  BlockStatement,

  Ident,
  Boolean,
  Integer,
  String,
  Prefix,
  Infix,
  If,
  Function,
  Call,
  Array,
  Index,
  Hash,
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
 * Return Ast
 */
export class Return implements Statement {
  public type: AstType = AstType.Return
  constructor(public keyword: Token, public expr?: Expression) {}
}

/**
 * ExpressionStatement Ast
 */
export class Expression implements Expression {
  public type: AstType = AstType.ExpressionStatement
  constructor(public expr?: Expression) {}
}

/**
 * BlockStatement Ast
 */
export class BlockStatement implements Expression {
  public type: AstType = AstType.ExpressionStatement
  constructor(public statements: Statement[]) {}
}

/**
 * Ident Ast
 */
export class Ident implements Expression {
  public type: AstType = AstType.Ident
  constructor(public name: Token) {}
}

/**
 * Boolean Ast
 */
export class Boolean implements Expression {
  public type: AstType = AstType.Boolean
  constructor(public value: Token) {}
}

/**
 * Integer Ast
 */
export class Integer implements Expression {
  public type: AstType = AstType.Integer
  constructor(public value: Token) {}
}

/**
 * Prefix Ast
 */
export class Prefix implements Expression {
  public type: AstType = AstType.Prefix
  constructor(public op: Token, public expr: Expression) {}
}

/**
 * Infix Ast
 */
export class Infix implements Expression {
  public type: AstType = AstType.Prefix
  constructor(
    public left: Expression,
    public op: Token,
    public right: Expression
  ) {}
}

/**
 * If Ast
 */
export class If implements Expression {
  public type: AstType = AstType.If
  constructor(
    public cond: Expression,
    public thenBlock: BlockStatement,
    public elseBlock?: BlockStatement
  ) {}
}

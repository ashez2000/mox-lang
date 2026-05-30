import { Token } from './token.js'

export type Ast = Stmt | Expr

export const enum AstType {
  LetStmt = 'LetStmt',
  ReturnStmt = 'ReturnStmt',
  ExprStmt = 'ExprStmt',
  PrintStmt = 'PrintStmt',

  Null = 'Null',
  Bool = 'Bool',
  Int = 'Int',
  String = 'String',
  Ident = 'Ident',
  Prefix = 'Prefix',
  Infix = 'Infix',
  If = 'If',
  Function = 'Function',
  Call = 'Call',
  Array = 'Array',
  Index = 'Index',
  HashMap = 'HashMap',
}

export type Ident = { type: AstType.Ident; name: Token }

export type Stmt =
  | { type: AstType.LetStmt; name: Token; expr: Expr }
  | { type: AstType.ReturnStmt; keyword: Token; expr: Expr }
  | { type: AstType.ExprStmt; expr: Expr }
  | { type: AstType.PrintStmt; expr: Expr }

export type Expr =
  | { type: AstType.Null }
  | { type: AstType.Bool; value: boolean }
  | { type: AstType.Int; value: number }
  | { type: AstType.String; value: string }
  | Ident
  | { type: AstType.Prefix; op: Token; expr: Expr }
  | { type: AstType.Infix; op: Token; left: Expr; right: Expr }
  | { type: AstType.If; condition: Expr; thenBlock: Stmt[]; elseBlock?: Stmt[] }
  | { type: AstType.Function; parameters: Ident[]; body: Stmt[] }
  | { type: AstType.Call; fnExpr: Expr; args: Expr[] }
  | { type: AstType.Array; elements: Expr[] }
  | { type: AstType.Index; left: Expr; index: Expr }
  | { type: AstType.HashMap; keys: Expr[]; values: Expr[] }

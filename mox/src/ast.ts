import { Token } from './token-v2.js'

export type Stmt =
  | { type: 'LetStmt'; name: Token; value: Expr }
  | { type: 'ReturnStmt'; value: Expr }
  | { type: 'ExprStmt'; value: Expr }

export type Expr = {}

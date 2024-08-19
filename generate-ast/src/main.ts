import fs from 'node:fs'

function main(args: string[]) {
  if (args.length != 1) {
    console.log('Usage: generate-ast <output directory>')
    process.exit(64)
  }

  const outputDir = args[0]

  let header = '// NOTE: this file is generated using generate-ast package\n\n'
  let imports = 'import {Token} from "./token.js"\n\n'

  const stmt = defineAst('Stmt', [
    'Let       - token: Token, name: Ident, value: Expr',
    'Return    - token: Token, value: Expr',
    'ExprStmt  - token: Token, value: Expr',
    'BlockStmt - token: Token, statements: Stmt[]',
  ])

  const expr = defineAst('Expr', [
    'Ident    - token: Token, name: string',
    'Bool     - token: Token, value: boolean',
    'Int      - token: Token, value: number',
    'Prefix   - token: Token, operator: string, right: Expr',
    'Infix    - token: Token, operator: string, left: Expr, right: Expr',
    'IfExpr   - token: Token, condidtion: Expr, thenBlock: BlockStmt, elseBlock: BlockStmt | null',
    'FnExpr   - token: Token, parameters: Ident[], body: BlockStmt',
    'CallExpr - token: Token, fnExpr: Expr, args: Expr[]', // TODO: remove literal in future
  ])

  fs.writeFileSync(outputDir + '/ast.ts', header + imports + stmt + expr)
}

function defineAst(baseName: string, types: string[]) {
  let code = ''
  code += '//\n'
  code += `// ${baseName}\n`
  code += '//\n\n'
  code += `export abstract class ${baseName} {\n`
  code += `abstract accept<T>(visitor: ${baseName}Visitor<T>): T\n }\n`
  code += '\n'

  code += defineVisitor(baseName, types)
  code += '\n'

  for (const t of types) {
    const className = t.split('-')[0].trim()
    const fields = t.split('-')[1].trim()
    code += defineType(baseName, className, fields)
    code += '\n'
  }

  return code
}

function defineType(baseName: string, className: string, fieldList: string) {
  let code = ''
  code += `export class ${className} extends ${baseName} {\n`
  code += `constructor (`

  code += fieldList
    .split(',')
    .map((f) => `public ${f}`)
    .join(',')

  code += ') { super() }\n\n'

  code += `accept<T> (visitor: ${baseName}Visitor<T>): T {\n`
  code += `return visitor.visit${className}${baseName}(this) } }\n`

  return code
}

function defineVisitor(baseName: string, types: string[]) {
  let code = ''
  code += `export interface ${baseName}Visitor<T> {\n`

  for (const t of types) {
    const typeName = t.split('-')[0].trim()
    code += `visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): T\n`
  }

  code += '}\n'

  return code
}

main(process.argv.slice(2))

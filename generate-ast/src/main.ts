import fs from 'node:fs'

function main(args: string[]) {
  if (args.length != 1) {
    console.log('Usage: generate-ast <output directory>')
    process.exit(64)
  }

  const outputDir = args[0]

  defineAst(outputDir, 'Stmt', [
    'Let        - name: expr.Ident, value: expr.Expr',
    'Return     - keyword: Token, value?: expr.Expr',
    'Print      - expr: expr.Expr',
    'Expression - expr: expr.Expr',
    'Block      - statements: Stmt[]',
    'Program    - statements: Stmt[]',
  ])

  defineAst(outputDir, 'Expr', [
    'Ident    - name: Token',
    'Bool     - value: boolean',
    'Int      - value: number',
    'String   - value: string',
    'Prefix   - operator: Token, right: Expr',
    'Infix    - operator: Token, left: Expr, right: Expr',
    'If       - condidtion: Expr, thenBlock: stmt.Block, elseBlock?: stmt.Block',
    'Fn       - name: Token, parameters: Ident[], body: stmt.Block',
    'Call     - fnExpr: Expr, args: Expr[]',
    'Array    - elements: Expr[]',
    'Index    - left: Expr, index: Expr',
    'HashMap  - keys: Expr[], values: Expr[]',
  ])
}

function defineAst(outputDir: string, baseName: string, types: string[]) {
  const path = `${outputDir}/${baseName.toLowerCase()}.ts`

  let code = ''
  code += "import { Token } from './token.js'\n"

  if (baseName === 'Stmt') {
    code += "import * as expr from './expr.js'\n"
  }

  if (baseName === 'Expr') {
    code += "import * as stmt from './stmt.js'\n"
  }

  code += '\n'
  code += `export abstract class ${baseName} {\n`
  code += 'abstract accept<T>(visitor: Visitor<T>): T\n }\n'
  code += '\n'

  code += defineVisitor(baseName, types)
  code += '\n'

  for (const t of types) {
    const className = t.split('-')[0].trim()
    const fields = t.split('-')[1].trim()
    code += defineType(baseName, className, fields)
    code += '\n'
  }

  fs.writeFileSync(path, code)
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
  code += `accept<T> (visitor: Visitor<T>): T {\n`
  code += `return visitor.visit${className}${baseName}(this) } }\n`

  return code
}

function defineVisitor(baseName: string, types: string[]) {
  let code = ''
  code += `export interface Visitor<T> {\n`

  for (const t of types) {
    const typeName = t.split('-')[0].trim()
    code += `visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): T\n`
  }

  code += '}\n'

  return code
}

main(process.argv.slice(2))

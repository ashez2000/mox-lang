import fs from 'node:fs'

function main(args: string[]) {
  if (args.length != 1) {
    console.log('Usage: generate-ast <output directory>')
    process.exit(64)
  }

  const outputDir = args[0]

  defineAst(outputDir, 'Stmt', [
    'Program  - statements: Stmt[]',
    'Let      - token: Token, name: expr.Ident, expr: expr.Expr',
    'Return   - token: Token, expr: expr.Expr',
    'Print    - token: Token, expr: expr.Expr',
    'Expr     - token: Token, expr: expr.Expr',
    'Block    - token: Token, statements: Stmt[]',
  ])

  defineAst(outputDir, 'Expr', [
    'Ident    - token: Token, name: string',
    'Bool     - token: Token, value: boolean',
    'Int      - token: Token, value: number',
    'String   - token: Token, value: string',
    'Prefix   - token: Token, operator: string, right: Expr',
    'Infix    - token: Token, operator: string, left: Expr, right: Expr',
    'If       - token: Token, condidtion: Expr, consequence: stmt.Block, alternative: stmt.Block | null = null',
    'Func     - token: Token, parameters: Ident[], body: stmt.Block',
    'Call     - token: Token, func: Expr, args: Expr[]',
    'Array    - token: Token, elements: Expr[]',
  ])
}

function defineAst(outputDir: string, baseName: string, types: string[]) {
  const path = `${outputDir}/${baseName.toLowerCase()}.ts`

  // TODO: Refactor to file writer
  let code = ''
  code += "import { Token } from '../token.js'\n"

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

  const args = fieldList
    .split(',')
    .map((f) => f.split(':')[0])
    .join(',')

  code += `static new (${fieldList}): ${className} { return new ${className}(${args})  }\n\n`

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

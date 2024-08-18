import fs from 'node:fs'

function main(args: string[]) {
  if (args.length != 1) {
    console.log('Usage: generate-ast <output directory>')
    process.exit(64)
  }

  const outputDir = args[0]

  let imports = 'import {Token} from "./token.js"\n\n'

  const stmt = defineAst('Stmt', [
    'Let    - token: Token, name: Identifier, expr: Expr',
    'Return - token: Token, expr: Expr',
  ])

  const expr = defineAst('Expr', ['Identifier - name: Token, value: string'])

  fs.writeFileSync(outputDir + '/ast.ts', imports + stmt + expr)
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

import { test } from 'node:test'
import { strict as assert } from 'node:assert'

import { Lexer } from '../lexer'
import { Parser } from '../parser'
import printer from '../ast/printer'
import { Expr } from '../ast/stmt'

test('test operator precedece parsing', () => {
  // tests :: [[input, expected]]
  const tests = [
    ['-a * b', '((-a) * b)'],
    ['!-a', '(!(-a))'],
    ['a + b + c', '((a + b) + c)'],
    ['a + b - c', '((a + b) - c)'],
    ['a * b * c', '((a * b) * c)'],
    ['a * b / c', '((a * b) / c)'],
    ['a + b / c', '(a + (b / c))'],
    ['a + b * c + d / e - f', '(((a + (b * c)) + (d / e)) - f)'],
    ['5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))'],
    ['5 < 4 != 3 > 4', '((5 < 4) != (3 > 4))'],
    ['3 + 4 * 5 == 3 * 1 + 4 * 5', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],
    ['true', 'true'],
    ['false', 'false'],
    ['3 > 5 == false', '((3 > 5) == false)'],
    ['3 < 5 == true', '((3 < 5) == true)'],
    ['1 + (2 + 3) + 4', '((1 + (2 + 3)) + 4)'],
    ['(5 + 5) * 2', '((5 + 5) * 2)'],
    ['2 / (5 + 5)', '(2 / (5 + 5))'],
    ['(5 + 5) * 2 * (5 + 5)', '(((5 + 5) * 2) * (5 + 5))'],
    ['-(5 + 5)', '(-(5 + 5))'],
    ['!(true == true)', '(!(true == true))'],
    // ['a + add(b * c) + d', '((a + add((b * c))) + d)'],
    // ['add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))'],
    // ['add(a + b + c * d / f + g)', 'add((((a + b) + ((c * d) / f)) + g))'],
    // ['a * [1, 2, 3, 4][b * c] * d', '((a * ([1, 2, 3, 4][(b * c)])) * d)'],
    // ['add(a * b[2], b[1], 2 * [1, 2][1])', 'add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))'],
  ]

  for (let i = 0; i < tests.length; i++) {
    const input = tests[i][0]
    const expected = tests[i][1]

    const lexer = Lexer.new(input)
    const parser = Parser.new(lexer)

    const program = parser.parse()
    if (parser.errors.length != 0) {
      for (const e of parser.errors) {
        console.log(e)
      }
      assert.fail('parser has errors')
    }

    assert(program.statements.length == 1, `tests[${i}]`)
    assert.equal(printer.printStmt(program.statements[0]), expected, `tests[${i}]`)
  }
})

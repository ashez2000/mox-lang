type Instructions = number[]

enum OpCode {
  Constant,
}

class Definition {
  constructor(public name: string, public operandWidth: number[]) {}
}

const definitions = new Map<OpCode, Definition>([[OpCode.Constant, new Definition('OpConstant', [])]])

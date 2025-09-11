export type Value = number

export class ValuePool {
  public values: Value[] = []

  write(value: Value) {
    this.values.push(value)
  }

  free() {
    this.values.length = 0
  }
}

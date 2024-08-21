import { MonkeyObject } from './object'

export class Environment {
  private store: Map<string, MonkeyObject> = new Map()
  private outer: Environment | undefined

  constructor(outer?: Environment) {
    this.outer = outer
  }

  get(name: string): MonkeyObject | undefined {
    return this.store.get(name) ?? this.outer?.get(name)
  }

  set(name: string, value: MonkeyObject) {
    this.store.set(name, value)
  }
}

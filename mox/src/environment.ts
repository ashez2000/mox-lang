import { MoxObject } from './object'

export class Environment {
  private store: Map<string, MoxObject> = new Map()
  private outer: Environment | undefined

  constructor(outer?: Environment) {
    this.outer = outer
  }

  get(name: string): MoxObject | undefined {
    return this.store.get(name) ?? this.outer?.get(name)
  }

  set(name: string, value: MoxObject) {
    this.store.set(name, value)
  }
}
